# 设计器属性修改无响应 — 全面调查与修复方案

> **状态**: 已完成修复 | **日期**: 2026-06-03

## 概述

用户报告：在属性面板修改组件属性后，设计器画布没有视觉反馈。经全面代码审查，发现多个类别的问题，涉及属性名映射错误、适配器组件缺失、属性传递链路断裂等。

---

## 数据流架构回顾

```
PropertyPanel (onChange)
  → dispatch({ type: 'UPDATE_FIELD', fieldId, patch: { componentProps: {...} } })
  → reducer (updateFieldInTree)
  → Designer re-render (state.schema.fields 变化)
  → Canvas → RootFields → SortableField
    → 容器组件: ContainerPreview (直接读 field.componentProps)
    → 非容器组件: FieldRenderer (spread field.componentProps → defaultAdapter → 查 componentRegistry → adapter 组件)
```

---

## 问题清单

### 问题 1 [严重] Text 组件 `align` 属性键名不匹配

**文件**: `packages/core/src/components/text/Props.tsx`  
**相关文件**: `packages/adapter-antd/src/components/Text.tsx`

Props.tsx 写入 `componentProps` 的键为 `align`，但 `TextProps` 类型定义和 adapter 组件期望的键为 `textAlign`。

Props.tsx 第 30-38 行:
```tsx
<FieldItem label="对齐方式">
  <w.ButtonGroup
    value={(values.align as string) ?? 'left'}
    onChange={(v) => onChange('align', v)}   // ← 写入 'align'
    ...
  />
</FieldItem>
```

TextProps 类型 (`packages/core/src/components/text/types.ts` 第 18 行):
```ts
textAlign?: 'left' | 'center' | 'right'  // ← 期望 'textAlign'
```

Adapter (`packages/adapter-antd/src/components/Text.tsx`) 未解构 `textAlign`，但通过 `...rest` 传给 `Typography.Text`。Antd 的 `Typography.Text` 不直接支持 `textAlign` 属性 — 需要走 `style`。

**影响**: 修改对齐方式完全无效，设计器画布无反应。

**修复**:
- Props.tsx: 将 `onChange('align', v)` 改为 `onChange('textAlign', v)`
- Adapter Text: 解构 `textAlign` 并合并到 `style` 中

---

### 问题 2 [严重] Title 组件 `align` 属性键名不匹配

**文件**: `packages/core/src/components/title/Props.tsx`  
**相关文件**: `packages/adapter-antd/src/components/Title.tsx`

同 Text 组件，Props.tsx 写入 `align`，但 `TitleProps` 类型定义键为 `textAlign`。

Props.tsx 第 23-32 行:
```tsx
<FieldItem label="对齐方式">
  <w.ButtonGroup
    value={(values.align as string) ?? 'left'}
    onChange={(v) => onChange('align', v)}   // ← 写入 'align'
    ...
  />
</FieldItem>
```

TitleProps 类型 (`packages/core/src/components/title/types.ts` 第 17 行):
```ts
textAlign?: 'left' | 'center' | 'right'  // ← 期望 'textAlign'
```

**影响**: 修改对齐方式完全无效。

**修复**:
- Props.tsx: 将 `onChange('align', v)` 改为 `onChange('textAlign', v)`
- Adapter Title: 解构 `textAlign` 并合并到 `style` 中

---

### 问题 3 [严重] Text 组件 `fontSize` / `color` 属性未传递给底层组件

**文件**: `packages/adapter-antd/src/components/Text.tsx`

Props.tsx 正确写入 `fontSize` 和 `color` 到 `componentProps`。Adapter Text 组件通过 `...rest` 传给 Antd 的 `Typography.Text`。但 Antd 的 `Typography.Text` 不直接支持 `fontSize` 和 `color` 属性 — 它们需要合并到 `style` 中。

```tsx
// adapter-antd Text 组件当前实现
const textProps: any = {
  type, strong, italic, keyboard, mark, underline, delete: deleteProp, code, disabled, ellipsis, style, className, id, ...rest,
}
```

`fontSize` 和 `color` 在 `...rest` 中，被传给 `Typography.Text`，但会被忽略。

**影响**: 修改字号和颜色在画布中无反应。

**修复**: Adapter 中解构 `fontSize` 和 `color`，合并到 `style`:
```tsx
const { fontSize, color, ...rest } = restProps
const mergedStyle = { fontSize, color, ...style }
```

---

### 问题 4 [严重] Title 组件 `color` 属性未传递给底层组件

**文件**: `packages/adapter-antd/src/components/Title.tsx`

同 Text 组件，`color` 通过 `...rest` 传给 `Typography.Title` 但不会被消费。

**影响**: 修改标题颜色在画布中无反应。

**修复**: 同问题 3，解构 `color` 并合并到 `style`。

---

### 问题 5 [严重] cascader / tree-select 组件未在 adapter-antd 中注册

**文件**: `packages/adapter-antd/src/index.tsx`

`antdComponents` 映射中缺少 `Cascader` 和 `TreeSelect` 注册：

```ts
// 当前 antdComponents 中不存在以下条目：
// 'Cascader': React.lazy(...)
// 'TreeSelect': React.lazy(...)
```

但 `PropsRenderMap` 中已注册了 PropsRender:
```ts
cascader: CascaderPropsRender,
'tree-select': TreeSelectPropsRender,
```

这意味着用户可以在属性面板中编辑 cascader/tree-select 的属性，但画布中用 `defaultAdapter` 渲染时找不到对应组件，会显示"未知字段类型"。

**影响**: cascader 和 tree-select 组件在画布中完全无法渲染。

**修复**: 在 `antdComponents` 中添加:
```ts
'Cascader': React.lazy(() => import('./components/Cascader').then(m => ({ default: m.Cascader }))),
'TreeSelect': React.lazy(() => import('./components/TreeSelect').then(m => ({ default: m.TreeSelect }))),
```

---

### 问题 6 [中等] Divider 组件 `color` / `thickness` 属性未消费

**文件**: `packages/adapter-antd/src/components/Divider.tsx`

Props.tsx 写入 `color` 和 `thickness` 到 `componentProps`。Adapter 组件通过 `...rest` 传给 Antd 的 `Divider`，但 Antd Divider 不支持 `color` 和 `thickness`（它只有 `style`）。

**影响**: 修改分割线颜色和粗细在画布中无反应。

**修复**: Adapter 中解构 `color` 和 `thickness`，合并到 `style`:
```tsx
const { color, thickness, ...restProps } = rest
const mergedStyle = {
  ...(color ? { borderColor: color } : {}),
  ...(thickness ? { borderTopWidth: thickness } : {}),
  ...style,
}
```

---

### 问题 7 [中等] Container 组件 `gap` 属性在 adapter 中未消费

**文件**: `packages/adapter-antd/src/components/Container.tsx`

Props.tsx 正确写入 `gap` 到 `componentProps`。但 adapter Container 组件未解构 `gap`，它通过 `...rest` 传给外层 `<div>`，React 不会把 `gap` 作为有效的 DOM 属性处理。

**影响**: 修改容器间距在画布中无反应（注意：画布中使用 `ContainerPreview` 渲染容器，它有自己的样式逻辑，所以此问题仅影响 FormRender 预览模式）。

**修复**: Adapter 中解构 `gap` 并合并到 `containerStyle`:
```tsx
const { gap, ...restProps } = rest
containerStyle.gap = gap ? `${gap}px` : undefined
```

---

### 问题 8 [中等] ContainerPreview 垂直容器未使用 gap

**文件**: `packages/core/src/designer/ContainerPreview.tsx`

在画布中，垂直布局的容器（`ContainerPreview` 第 232-273 行）直接渲染子项，没有使用 `field.componentProps?.gap` 来设置间距。而 `ContainerPreview` 的水平布局使用了 `gap`。`flex` 类型的容器通过 `getFlexStyle` 使用了 `gap`。

**影响**: 在画布中修改垂直容器（非 flex）的 gap 属性无效果。

**修复**: 在垂直容器的外层 div 上添加 `gap: token('spacingSm')` 或读取 `field.componentProps?.gap`。

---

### 问题 9 [低] Button 组件的 `icon` 属性为字符串但 adapter 期望 ReactNode

**文件**: `packages/core/src/components/button/Props.tsx` 第 43 行  
**文件**: `packages/adapter-antd/src/components/Button.tsx`

Props.tsx 中 icon 被当作字符串输入:
```tsx
<w.Input value={(values.icon as string) ?? ''} onChange={(v) => onChange('icon', v)} placeholder="如: SearchOutlined" />
```

但 Antd Button 的 `icon` 属性期望 `ReactNode`。字符串无法作为图标渲染。

**影响**: 按钮图标属性在画布中无效果。

**修复**: 此问题需要更复杂的方案（如支持图标名称映射），建议作为后续优化。

---

### 问题 10 [低] 属性面板 stale closure 风险

**文件**: `packages/core/src/designer/PropertyPanel.tsx` 第 129-135 行

```tsx
onChange={(key: string, value: unknown) => {
    dispatch({
        type: 'UPDATE_FIELD',
        fieldId: field.id!,
        patch: { componentProps: { ...field.componentProps, [key]: value } },
    })
}}
```

`field.componentProps` 在闭包中被捕获。在 React 18 并发模式下，如果两个快速连续的变化在同一渲染帧内批处理，后一个变化可能丢失前一个的变化。

**影响**: 极快连续操作时可能丢失属性变更（低概率）。

**修复**: 使用函数式更新或 useCallback 配合正确的依赖。由于 reducer 不支持函数式 update，可改为使用 ref 存储最新 componentProps。

---

## 修复优先级

| 优先级 | 问题 | 影响范围 |
|--------|------|----------|
| P0 | 问题 1-2: Text/Title align 键名不匹配 | 常用展示组件对齐完全失效 |
| P0 | 问题 3-4: Text/Title fontSize/color 未传递 | 展示组件样式完全失效 |
| P1 | 问题 5: cascader/tree-select 未注册 | 组件画布无法渲染 |
| P1 | 问题 6: Divider color/thickness 未消费 | 分割线样式失效 |
| P2 | 问题 7: Container gap 未消费 | 容器间距失效 |
| P2 | 问题 8: ContainerPreview 垂直容器无 gap | 画布中容器间距失效 |
| P3 | 问题 9: Button icon 字符串不支持 | 按钮图标失效 |
| P3 | 问题 10: stale closure 风险 | 极低概率丢失变更 |

---

## 修复文件清单

### 需要修改的文件

1. **`packages/core/src/components/text/Props.tsx`** — 将 `align` 改为 `textAlign`
2. **`packages/core/src/components/title/Props.tsx`** — 将 `align` 改为 `textAlign`
3. **`packages/adapter-antd/src/components/Text.tsx`** — 解构 `textAlign`, `fontSize`, `color` 并合并到 `style`
4. **`packages/adapter-antd/src/components/Title.tsx`** — 解构 `textAlign`, `color` 并合并到 `style`
5. **`packages/adapter-antd/src/index.tsx`** — 添加 `Cascader` 和 `TreeSelect` 到 `antdComponents`
6. **`packages/adapter-antd/src/components/Divider.tsx`** — 解构 `color`, `thickness` 并合并到 `style`
7. **`packages/adapter-antd/src/components/Container.tsx`** — 解构 `gap` 并合并到 `containerStyle`
8. **`packages/core/src/designer/ContainerPreview.tsx`** — 垂直容器使用 `gap` 属性
9. **`packages/core/src/designer/PropertyPanel.tsx`** — 修复 componentProps 的 stale closure

### 可选修复

10. **`packages/adapter-antd/src/components/Button.tsx`** — icon 字符串转 ReactNode（需要图标映射基础设施）

---

## 验证方案

1. 启动 example 项目，逐个测试每个组件属性的修改是否在画布中实时反映
2. 重点验证 Text 组件的对齐方式、字号、颜色
3. 重点验证 Title 组件的对齐方式、颜色
4. 验证 cascader/tree-select 能否在画布中正常渲染
5. 验证 Divider 的颜色和粗细
6. 验证 Container 的 gap 间距
7. 运行 `pnpm build` 确保编译通过
8. 运行 `pnpm check:tokens` 确保主题 Token 合规