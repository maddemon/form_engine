# HTML + JSX 组件实施计划

## 一、HTML 组件

### 文件清单

| # | 文件 | 操作 | 内容概要 |
|---|---|---|---|
| 1 | `packages/core/src/components/html/Props.tsx` | **新建** | 属性面板：一个 `TextArea` 编辑 `content` 字段 |
| 2 | `packages/core/src/components/index.ts` | **改** | 导入 `meta as html` + 注册到 `componentRegistry` + 导出 `HtmlProps` |
| 3 | `packages/core/src/propRenders/index.ts` | **改** | `html: HtmlPropsRender` 加到 `PropsRenderMap` |
| 4 | `packages/core/src/designer/paletteData.ts` | **改** | `display` 组加 `'html'` |
| 5 | `packages/adapter-antd/src/components/Html.tsx` | **新建** | `<div dangerouslySetInnerHTML={{ __html: content }} />` |
| 6 | `packages/adapter-antd/src/index.tsx` | **改** | 导入 `Html` + 注册 `components.html` |
| 7 | `packages/adapter-antd-mobile/src/components/Html.tsx` | **新建** | 同上 |
| 8 | `packages/adapter-antd-mobile/src/index.tsx` | **改** | 导入 + 注册 `components.html` |

### Props 定义（已有，无需改）

```tsx
// core/src/components/html/index.ts
export interface HtmlProps extends BaseComponentProps {
  content: string
}
```

### 属性面板

`HtmlPropsRender` 只放一个多行文本框编辑 `content`。

### adapter 渲染

两个 adapter 实现一样 —— `dangerouslySetInnerHTML`。

---

## 二、JSX 组件

### 架构总览

```
┌─────────────────────────────────────────────────────┐
│ FormRender / Designer                               │
│  ├─ desktopAdapter.jsxScope  →  { AntCard, AntTag, ... }│
│  ├─ mobileAdapter.jsxScope   →  { AntmCard, AntmSwiper, } │
│  └─ jsxScope (user)          →  用户额外组件         │
│                                                      │
│  mergeJsxScope()                                     │
│    = { scene, ...Ant*, ...Antm*, ...user }          │
│                                                      │
│  JsxRender (core 包)                                 │
│    new Function('React', ...keys, 'props', code)()   │
└─────────────────────────────────────────────────────┘
```

### 2.1 类型定义

**`packages/core/src/types/adapter.ts`** — `FormEngineAdapter` 新增字段：

```tsx
export interface FormEngineAdapter {
  // ... 现有字段 ...
  jsxScope?: Record<string, React.ComponentType<any>>
}
```

**`packages/core/src/types/schema.ts`** — `FormFieldSchema.componentProps` 用于 JSX：

```tsx
// schema 中 type='jsx' 时
{
  type: 'jsx',
  componentProps: {
    code: '<div>{props.content}</div>',          // JSX 源码
    compiledCode: 'React.createElement("div"...', // 编译后代码
  }
}
```

已有 `componentProps: Record<string, unknown>` 够用，无需改类型。

### 2.2 元数据（core 包）

**`packages/core/src/components/jsx/index.ts`** — 新建：

```tsx
export interface JsxProps extends BaseComponentProps {
  code?: string
  compiledCode?: string
}

export const meta: ComponentRegistration = {
  label: 'component.jsx.label',
  category: 'display',
  icon: 'Code',
  defaultProps: { componentProps: { code: '<div>Hello</div>', compiledCode: '' } },
  eventDeclarations: [],
}
```

### 2.3 Scope 合并工具

**`packages/core/src/renderer/jsxScope.ts`** — 新建：

```tsx
import type { FormEngineAdapter, DeviceScene } from '../types/adapter'

export interface JsxScopeContextValue {
  scope: Record<string, unknown>
}

export function mergeJsxScope(
  desktopAdapter?: FormEngineAdapter,
  mobileAdapter?: FormEngineAdapter,
  scene?: DeviceScene,
  userScope?: Record<string, React.ComponentType>,
): Record<string, unknown> {
  return {
    scene,
    ...desktopAdapter?.jsxScope,
    ...mobileAdapter?.jsxScope,
    ...userScope,
  }
}
```

`JsxScopeContext` 通过 React Context 下发，`JsxRender` 消费。

### 2.4 JSX 渲染器

**`packages/core/src/renderer/JsxRender.tsx`** — 新建：

```tsx
const JsxRender = React.memo<{
  compiledCode: string
  scope: Record<string, unknown>
  componentProps: Record<string, unknown>
  value: unknown
  onChange: (v: unknown) => void
}>(({ compiledCode, scope, componentProps, value, onChange }) => {
  // new Function('React', ...Object.keys(scope), 'props', 'value', 'onChange', compiledCode)
  // return fn(React, ...Object.values(scope), { ...componentProps, value, onChange }, value, onChange)
})
```

### 2.5 FieldRenderer 接入

**`packages/core/src/renderer/FieldRenderer.tsx`** — 改：

遇到 `type === 'jsx'` 时从 `context` 取 `jsxScope`，走 `JsxRender`。

### 2.6 Designer 属性面板 JSX 编辑器

**`packages/core/src/components/jsx/Props.tsx`** — 新建：

- TextArea 编辑 `code`（JSX 源码）
- 「编译」按钮 → `await import('@babel/standalone')` → `transform(code, { presets: ['react'] })` → 写入 `compiledCode`
- 编译按钮带 loading 状态
- `@babel/standalone` 只在点击时下载，不是静态依赖

### 2.7 注册

| # | 文件 | 操作 |
|---|---|---|
| 1 | `core/src/components/index.ts` | `import { meta as jsx }` + 注册 `jsx` 到 `componentRegistry` |
| 2 | `core/src/propRenders/index.ts` | `jsx: JsxPropsRender` 加到 `PropsRenderMap` |
| 3 | `core/src/designer/paletteData.ts` | `display` 组加 `'jsx'` |
| 4 | `core/src/renderer/FormRender.tsx` | `FormRenderInner` 里加 `mergeJsxScope` + 提供 `JsxScopeContext` |
| 5 | `core/src/designer/Designer.tsx` | `DesignerInner` 里加 `mergeJsxScope` + 传给画布 Context |

### 2.8 无冲突说明

`adapter.jsxScope` 和 `adapter.components` 是两条完全独立的通路：

```
adapter.components['card']  ← schema type:'card'，走 FormItem 包装
jsxScope.AntCard            ← JSX 里写 <AntCard>，裸 antd Card
```

用户在自己的 `jsxScope` 注入 `Card: AntCard` 也不会影响系统的 `components.card`。

### 2.9 Adapter 的 jsxScope 白名单

**`packages/adapter-antd/src/index.tsx`** — 改：

```tsx
export const antdAdapter: FormEngineAdapter = {
  // ...现有字段...
  jsxScope: {
    AntCard, AntTag, AntTable,
    AntButton, AntInput, AntBadge,
    AntAlert, AntProgress, AntAvatar,
    AntList, AntEmpty, AntSpin,
    AntTooltip, AntPopover, AntQRCode,
    AntSkeleton, AntResult, AntSteps,
    AntDescriptions, AntSpace,
    AntRow, AntCol, AntDivider,
  },
}
```

**`packages/adapter-antd-mobile/src/index.tsx`** — 改：

```tsx
export const antdMobileAdapter: FormEngineAdapter = {
  // ...现有字段...
  jsxScope: {
    AntmCard, AntmBadge, AntmButton,
    AntmInput, AntmAvatar, AntmList,
    AntmEmpty, AntmSpin, AntmSwiper,
    AntmCapsuleTabs, AntmProgress,
    AntmSteps, AntmResult, AntmSkeleton,
    AntmNoticeBar, AntmPopover,
  },
}
```

### 2.9 外观（locale）

**`packages/core/src/locale/zh-CN.ts`** + **`en-US.ts`** — 改：

```tsx
jsx: {
  label: 'JSX',
  code: 'JSX 源码',
  codePlaceholder: '输入 JSX 代码...',
  compile: '编译',
  compileSuccess: '编译成功',
  compileError: '编译失败',
  noCompiledCode: '请先编译 JSX 代码',
}
```

### 2.10 Bundle 影响预估

| 包 | 增加 |
|---|---|
| `@form-engine/core` | ~60 行代码（`JsxRender` + `jsxScope.ts`），**零依赖** |
| `@form-engine/adapter-antd` | ~20 个 import + 20行 scope 定义 |
| `@form-engine/adapter-antd-mobile` | ~15 个 import + 15行 scope 定义 |
| Designer 运行时 | `@babel/standalone` 仅在点编译时动态加载 |

---

## 三、实施顺序

```
Phase 1 ─ HTML 组件（5 个文件改动，无依赖）
  ├─ Props.tsx
  ├─ components/index.ts / propRenders/index.ts / paletteData.ts
  └─ 两个 adapter 的 Html.tsx + index.tsx

Phase 2 ─ JSX 元数据 + 渲染器（core 包，无外部依赖）
  ├─ types/adapter.ts → jsxScope 字段
  ├─ components/jsx/index.ts
  ├─ renderer/jsxScope.ts
  ├─ renderer/JsxRender.tsx
  ├─ renderer/FieldRenderer.tsx → 接入
  └─ 注册相关文件

Phase 3 ─ jsxScope 白名单（两个 adapter）
  ├─ adapter-antd/src/index.tsx
  └─ adapter-antd-mobile/src/index.tsx

Phase 4 ─ Designer JSX 编辑器 + 编译（唯一外部依赖）
  ├─ components/jsx/Props.tsx
  ├─ designer/Designer.tsx → 接入 jsxScope
  └─ locale 更新

Phase 5 ─ 验证
  ├─ pnpm lint
  ├─ pnpm check:tokens
  ├─ pnpm test
  └─ pnpm build
```
