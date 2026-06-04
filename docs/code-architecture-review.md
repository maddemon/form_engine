# 代码架构审查报告

> 涵盖：代码重复、单一职责违反、性能问题、设计紧耦合、长函数。
>
> 日期：2026-06-04

---

## 目录

1. [代码重复](#1-代码重复)
2. [单一职责违反](#2-单一职责违反)
3. [性能问题](#3-性能问题)
4. [设计紧耦合](#4-设计紧耦合)
5. [长函数清单](#5-长函数清单)
6. [类型安全问题](#6-类型安全问题)

---

## 1. 代码重复

### 1.1 组件三层模板重复

每个组件目录 `packages/core/src/components/{name}/` 包含三个文件：

```
Props.tsx      — FieldItem + 属性编辑器
palette.tsx    — 调色板元数据（label, category, icon, defaultProps）
types.ts       — Props 接口 + EventDeclarations
```

27 个组件 × 3 文件 = **81 个文件**，结构完全相同。Props.tsx 平均 10-30 行模板化 JSX。

### 1.2 三套注册表需要同步

加一个组件必须修改 3 个独立注册表：

| 注册表 | 文件 | 条目 |
|--------|------|------|
| 调色板 | `components/paletteRegistry.ts:36-68` | 30+ |
| Props 渲染映射 | `propRenders/index.ts:41-74` | 30+ |
| 事件声明映射 | `components/index.ts:90-112` | 22 |

此外还要更新 `FieldType` 联合类型（`schema.ts:96-131`）、`isValidFieldType` 白名单（`FieldList.tsx:237-246`）、`getComponentCategory` 映射、以及两个 adapter 的 `components` 对象。**加一个组件触及 7 个文件**。

### 1.3 Adapter 间复制粘贴

**`DefaultField`** — 两个 adapter 的 index.tsx 中各有一份完全相同：

```tsx
const DefaultField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  return <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>未支持的字段类型：{fieldSchema?.type}</div>
}
```

- `adapter-antd/src/index.tsx:87-89`
- `adapter-antd-mobile/src/index.tsx:54-56`

**`transformValue` 函数** — themeBridge 中完全相同的逻辑：

- `adapter-antd/src/themeBridge.tsx:107-121`
- `adapter-antd-mobile/src/themeBridge.tsx:63-77`

**组件注册列表** — 30+ 个 key 在两个 adapter 中重复声明：

- `adapter-antd/src/index.tsx:110-145`
- `adapter-antd-mobile/src/index.tsx:80-115`

### 1.4 `Designer.tsx` 拖拽处理中的 sourcePos 重复

`handleDragEnd`（行 282-388）中 `sourcePos` 查找逻辑重复 **4 次**：

```
315: sourceEntry ? { parentId, index, regionKey } : findFieldPosition(...)
339: 同上（__container 分支）
356: 同上（同级排序分支）
```

`handleDragOver`（行 217-280）中还有 2 次类似模式。**同一个文件中重复 6 次**。

### 1.5 `CanvasToolbar.tsx` 撤销/重做按钮重复

行 64-77 和 81-94：两个 `<button>` JSX 结构完全相同，仅 `disabled`、`opacity`、文字不同。

### 1.6 ContainerPreview 样式重复

`ContainerPreview.tsx` 中 5 个容器类型的 droppable 区域样式几乎相同：

```
minHeight, border, background, borderRadius, transition
```

边线和背景色逻辑共 5 处重复（行 27-33, 76-91, 107-120, 132-149, 168-183）。

### 1.7 `collectFieldNames` 调用方式不一致

`reducer.ts:143` 已导出 `collectFieldNames`，`PropertyPanel.tsx:86` 正确导入了该函数。但 `PropertyPanel` 中 `existingNames` 的 `useMemo` 依赖了 `allFields` 和 `field.id`，每次 `allFields` 引用变化都会重新计算全部字段名集合，即使当前编辑字段的兄弟字段未变。

### 1.8 `eventContext` 依赖数组维护分散

`useFormRender.ts:99` 创建 `eventContext`（`useMemo` 依赖 `$form` + `callbacks`），`FieldRenderer.tsx:94` 消费该 context 并用 `useMemo` 解析事件处理器（依赖 `field.events` + `eventContext` + 其他）。两者依赖链较长，`eventContext` 的 `callbacks` 引用不稳定时会导致所有字段的事件处理器重算。

---

## 2. 单一职责违反

### 2.1 `PropertyPanel.tsx` — 349 行做 8+ 件事

一个文件同时处理：

| 职责 | 行号 | 说明 |
|------|------|------|
| Widget 合并 | 49-52 | `useWidgets()` 合并默认+注入 |
| 字段分类 | 229-233 | 调用 `getComponentCategory` |
| 5 个防抖输入 | 91-113 | label/name/defaultValue/hidden/colSpan |
| componentProps 防抖 | 115-149 | 自己管理 setTimeout，未复用已有 `useDebouncedInput` |
| 字段名校验 | 86-87 | `nameDirty` + `nameError` |
| Tab 管理 | 278-312, 319-320 | `PropertyPanelTabs` 子组件 + `activeTab` |
| 无字段时展示 | 332-340 | 显示 `FormConfigPanel` |
| 事件编辑器 | 193-222 | 内联 IIFE 渲染事件列表 |

**重点**：`componentProps` 的防抖（行 115-149）自己管理 `setTimeout`，但同一文件另一处（行 91-97）使用了已封装的 `useDebouncedInput`。不一致。

### 2.2 `Designer.tsx` — 460 行做 5+ 件事

| 职责 | 行号 | 说明 |
|------|------|------|
| State 管理 | 118, 148 | `useReducer` + `useFieldIndex` |
| DnD 编排 | 170-395 | 5 个回调：dragStart/Over/End/Cancel + collisionDetection |
| 字段位置解析 | 17-61 | `findFieldPosition` + `resolveDropTarget` |
| Schema 同步 | 127-131 | `useEffect` 监听 schema prop |
| 通知外部 | 144-146 | `useEffect` 调用 `notifyChange` |

### 2.3 `FieldRenderer.tsx` — 表达式计算混在渲染

行 47 和 50 的单行包含了 `evalExpr` 调用（内部 `new Function`），每次渲染都执行。

```ts
const isRequired = field.rules?.some(r => r.required) ||
  (field.requiredIfExpr ? !!evalExpr(field.requiredIfExpr, {...}) : false) ||
  (field.requiredWhen ? matchVisibleWhen(field.requiredWhen, {...}) : false)
```

三个条件链在一起，`evalExpr` 不可缓存、不可测试。

### 2.4 `ContainerPreview.tsx` — 类型分发不满足开闭原则

行 339-357 的 if/else 链根据 `field.type` 分发到 6 种容器渲染组件。每加一种容器类型就要改这个文件。

### 2.5 `reducer.ts:designerReducer` — 8 个 action 混合

157 行处理 8 个 action 类型。复制（`COPY_FIELD`）和移动（`MOVE_FIELD`）的逻辑耦合了 `insertAfter`、`cloneField`、`cloneFields` 三个独立函数，但分散在文件不同位置（行 20-46）。

---

## 3. 性能问题

### 3.1 关键组件缺少 `React.memo`

| 组件 | 文件 | 影响 |
|------|------|------|
| `FieldRenderer` | `renderer/FieldRenderer.tsx:43` | 递归树叶子节点，每次父渲染全部重渲 |
| `PropertyPanelInner` | `designer/PropertyPanel.tsx:227` | dispatch 时重渲 |
| `DefaultPropertyContent` | `designer/PropertyPanel.tsx:82` | 同上 |
| `FormConfigPanel` | `designer/FormConfigPanel.tsx:25` | 同上 |
| `CanvasToolbar` | `designer/CanvasToolbar.tsx` | 每次 Canvas 重渲 |

### 3.2 `DesignerContext` 单体引发级联重渲

一个 Context 包含 7 个值（`dispatch`, `selectedFieldId`, `onSelectField`, `scene`, `formConfig`, `adapter`, `desktopAdapter`）。任何值变化 → 所有调用 `useDesignerContext` 的 consumer 重渲。

**影响组件**：`FieldItem`、`NestedField`、`RootFields`、`Canvas`、`ContainerPreview`、`PropertyPanel`、`FormConfigPanel`。

**修复建议**：拆分 Context（dispatch 单独，其他按变更频率分组）。

### 3.3 `FormRender.tsx` 的 `NestedFieldRenderer` 10 个 props 破坏 memoization

```ts
interface NestedFieldRendererProps {
  field, formValues, fieldOptions, fieldErrors,
  loading, adapter, components, eventContext, formConfig, onFieldChange
}
```

10 个 props 中只有 `field` 是真正每个节点不同的。`formValues` 每次输入变化 → 所有 `NestedFieldRenderer` 接收新引用 → `React.memo` 失效。

### 3.4 `evalExpr` 在渲染路径中不可缓存

`FieldRenderer.tsx:47,50` 每次渲染都调用 `new Function()` 编译执行表达式，大表单场景开销大。

### 3.5 adapter 选择表达式每次重算

`Designer.tsx:153-154`：

```ts
const canvasAdapter = desktopAdapter && mobileAdapter
  ? (scene === 'mobile' ? mobileAdapter : desktopAdapter)
  : ((desktopAdapter ?? mobileAdapter) as FormEngineAdapter)
```

每次渲染重算，虽然开销小，但导致 Context value 引用变化（配合 3.2 的问题进一步放大）。

### 3.6 `ContainerPreview.tsx` 的 `.filter()` 操作

每次渲染对 `field.children` 做 `.filter()` 创建新数组（行 197, 216-217）。

---

## 4. 设计紧耦合

### 4.1 Designer 依赖 Renderer

`designer/NestedField.tsx:27` 直接 import 并使用 `renderer/FieldRenderer`：

```tsx
<FieldRenderer
  field={field}
  value={undefined} onChange={() => {}} options={[]} disabled={false}
  adapter={adapter} formConfig={formConfig}
/>
```

- designer 运行时依赖 renderer 组件
- 传入了 4 个 mock 值来适配 FieldRenderer 的运行时接口
- renderer 模块的 props 接口变更会直接影响 designer 模块

### 4.2 `useAdaptiveAdapter.ts` 位置不当

位于 `renderer/useAdaptiveAdapter.ts`，但实际是设备检测工具，不依赖 renderer 内部实现。应移至 `utils/`。

### 4.3 `designer/widgets.tsx` 多余重导出

```ts
// designer/widgets.tsx
export * from '../widgets/index'
```

增加一层无意义的间接引用。

### 4.4 `FormRender.tsx` 状态管理内聚过高

335 行组件包含：
- 4 个 useState（formValues, fieldOptions, fieldErrors, loading）
- 5 个 useCallback
- 2 个 useMemo
- 3 个 useEffect
- 2 个 useRef
- 组件内递归渲染函数 `renderNestedField`

### 4.5 `FieldSchemaContext` 和 `AdapterContext` 仅在 FieldRenderer 内提供

`FieldRenderer.tsx:148-157` 中：

```tsx
<FieldSchemaContext.Provider value={field}>
  <AdapterContext.Provider value={adapter}>
    {React.createElement(renderFn, fieldProps)}
  </AdapterContext.Provider>
</FieldSchemaContext.Provider>
```

这两个 Context 只在渲染叶子字段时可用。容器组件的子字段（由容器组件自己调用 `adapter.components[child.type]` 渲染）需要容器自己再 wrap 一遍。每个容器组件（`Table.tsx`、`Tabs.tsx` 等）不得不重复这段代码。

---

## 5. 长函数清单

| 函数 | 文件 | 行数 | 问题 |
|------|------|------|------|
| `handleDragEnd` | `Designer.tsx` | 105（282-387） | 5 条不同逻辑路径，6 次重复 sourcePos |
| `handleDragOver` | `Designer.tsx` | 63（217-280） | 复杂条件流 |
| `DefaultPropertyContent` | `PropertyPanel.tsx` | 142（82-224） | 8+ 字段区域，5 个防抖输入 |
| `designerReducer` | `reducer.ts` | 116（157-273） | 8 个 action case |
| `FormRender` | `FormRender.tsx` | 32（47-79） + 子函数 | 状态+渲染耦合 |

---

## 6. 类型安全问题

### 6.1 `any` 分布统计

| 包 | `: any` | `as any` | 涉及文件 |
|----|---------|----------|---------|
| core/src | ~15 | ~5 | `base-props.ts`, `resolver.ts`, `SimpleCustomComponentRegistry.ts` |
| adapter-antd | ~5 | ~13 | `Button.tsx`, `InputNumber.tsx`, `Select.tsx`, `Checkbox.tsx`, `Alert.tsx`, `Table.tsx`, `TreeSelect.tsx`, `Cascader.tsx`, `Flex.tsx`, `widgets/*.tsx` |
| adapter-antd-mobile | ~5 | ~10 | `Checkbox.tsx`, `Radio.tsx`, `Upload.tsx`, `Select.tsx`, `DatePicker.tsx`, `Card.tsx` |

**合计**：约 25 处 `: any` + 28 处 `as any`，遍布 25+ 个文件。

### 6.2 adapter-antd-mobile 批量 `as any` 模式

```ts
(fieldSchema.componentProps as any)?.xxx
```

5 个组件、8 处使用这个模式。根源是 `FieldComponentProps` 的 `fieldSchema` 为 optional + 索引签名。

### 6.3 冗余类型断言

- `FieldRenderer.tsx:77` — `(field.mock.options as OptionItem[])`，类型已匹配
- `FieldRenderer.tsx:175` — `(formConfig.labelAlign || 'right') as 'left' | 'right'`，类型已匹配
- `FieldRenderer.tsx:47,50` — `{} as Record<string, unknown>`，`{ [field.name]: value }` 的推断已是 `Record<string, unknown>`

### 6.4 事件系统签名过于宽松

```ts
// events/resolver.ts
export type ResolvedEventHandler = (...args: any[]) => any
callbacks: Record<string, (...args: any[]) => void>
```

事件处理器和 callbacks 均未定义参数类型，运行时通过 `string` 名称查找。所有类型信息丢失。

### 6.5 `FieldComponentProps` 索引签名导致完全失明

`[key: string]: any` 使所有已知 prop（`value`, `onChange`, `disabled`, `options` 等）的 IDE 提示和类型检查失效。在 adapter 组件内写 `props.任意字符串` 都不会报错，但也得不到提示。
