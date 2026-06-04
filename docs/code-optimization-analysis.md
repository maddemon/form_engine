# 代码优化分析报告

> 状态：**已完成**（4 项排除项另见独立规划文档）  
> 日期：2026-06-04  
> 最后更新：2026-06-04

---

## 目录

1. [总结](#1-总结)
2. [架构现状](#2-架构现状)
3. [发现的问题与优化建议](#3-发现的问题与优化建议)
   - [P0 · Bug](#p0--bug)
     - [3.1 ContainerPreview 违反 Hooks 规则](#31-containerpreview-违反-hooks-规则)
   - [P1 · 高性能影响](#p1--高性能影响)
     - [3.2 DesignerContext.Provider value 未 memo 化](#32-designercontextprovider-value-未-memo-化)
     - [3.3 FormRender 中 $form/eventContext 每帧重建](#33-formrender-中-formeventcontext-每帧重建)
     - [3.4 renderNestedField 每次渲染创建新闭包](#34-rendernestedfield-每次渲染创建新闭包)
     - [3.5 FieldRenderer 重复创建内联对象](#35-fieldrenderer-重复创建内联对象)
   - [P2 · 中等影响](#p2--中等影响)
     - [3.6 Designer 双 Context Provider 实例](#36-designer-双-context-provider-实例)
     - [3.7 缺少 React.memo 导致级联重渲染](#37-缺少-reactmemo-导致级联重渲染)
     - [3.8 useFormDesigner selectedField 不支持嵌套查找（Bug）](#38-useformdesigner-selectedfield-不支持嵌套查找bug)
     - [3.9 loadDataSource 闭包捕获 formValues 快照](#39-loaddatasource-闭包捕获-formvalues-快照)
     - [3.10 FormRender visibleFields 每次随 formValues 重算](#310-formrender-visiblefields-每次随-formvalues-重算)
     - [3.11 handleComponentPropsChange 防抖有边缘场景](#311-handlecomponentpropschange-防抖有边缘场景)
   - [P3 · 低影响 / 代码质量](#p3--低影响--代码质量)
     - [3.12 findInTree 在拖拽中被多次重复调用](#312-findintree-在拖拽中被多次重复调用)
     - [3.13 FormRender 状态管理过于耦合](#313-formrender-状态管理过于耦合)
     - [3.14 module-level debounceTimers 多实例冲突](#314-module-level-debouncetimers-多实例冲突)
     - [3.15 useFormDesigner 与 Designer 状态重复](#315-useformdesigner-与-designer-状态重复)
     - [3.16 StyleProvider fallback 每次创建新对象](#316-styleprovider-fallback-每次创建新对象)
     - [3.17 useEffect 依赖缺失 — FormRender ref 同步](#317-useeffect-依赖缺失--formrender-ref-同步)
     - [3.18 collectFieldNames 重复实现](#318-collectfieldnames-重复实现)
     - [3.19 ContainerPreview 空容器占位代码重复](#319-containerpreview-空容器占位代码重复)
     - [3.20 useAdaptiveAdapter 未兼容旧 Safari](#320-useadaptiveadapter-未兼容旧-safari)
     - [3.21 PropertyPanel 中 formConfig 类型为 any](#321-propertypanel-中-formconfig-类型为-any)
     - [3.22 CanvasToolbar 每次渲染创建新数组](#322-canvastoolbar-每次渲染创建新数组)
     - [3.23 Designer selectedField 每次都执行 findInTree](#323-designer-selectedfield-每次都执行-findintree)
4. [建议提取的 Hooks](#4-建议提取的-hooks)
5. [验证步骤](#5-验证步骤)

---

## 1. 总结

当前代码架构清晰，组件分层合理（core/adapter 分离、designer/renderer 分离），共发现 **23 个优化点**：

| 优先级 | 数量 | 典型问题 | 状态 |
|--------|------|---------|------|
| **P0（Bug）** | 1 | ContainerPreview 违反 Hooks 规则，切换容器类型时可能崩溃 | ✅ 已修复 |
| **P1（高）** | 4 | Context value 未 memo、$form 每帧重建、renderNestedField 闭包、FieldRenderer 内联对象 | ✅ 已修复 |
| **P2（中）** | 6 | 双 Provider、缺少 React.memo、selectedField 不支持嵌套查找、dataSource 参数过期、visibleFields 重算、防抖边缘场景 | ✅ 已修复 |
| **P3（低/质量）** | 12 | findInTree 重复、代码耦合、类型 any、重复代码、兼容性等 | ✅ 8 项已修复，4 项另见独立规划 |

**P1 性能问题涉及两条独立链路**：

- **Designer 链**：`Context.value` 内联对象未 memo → 所有消费者（Canvas/RootFields/NestedField/FieldItem/PropertyPanel）每次 Designer 渲染都重渲染 → 选中/拖拽时全局刷新
- **Renderer 链**：`formValues` 变化 → `$form` / `eventContext` 重建 → `renderNestedField` 新闭包 → `FieldRenderer` 新 props → adapter 组件全部渲染

修复后表单输入性能预计有数量级提升。

---

## 2. 架构现状

```
packages/core/src/
├── designer/          — 可视化设计器（拖拽、属性面板、画布）
│   ├── Designer.tsx   — 主组件，useReducer + dnd-kit
│   ├── reducer.ts     — Reducer + 撤销/重做
│   ├── hooks.ts       — useFormDesigner / useDesignerHistory
│   ├── DesignerContext.ts — Context 传递 dispatch/selectedFieldId
│   └── Canvas.tsx     — 画布渲染
├── renderer/          — 表单渲染器（运行时）
│   ├── FormRender.tsx — 主渲染器，内部 useState 管理所有状态
│   ├── FieldRenderer.tsx — 单字段渲染
│   └── validate.ts   — 校验
├── events/            — 事件引擎
├── dataSource/        — 数据源解析
├── styles/            — 主题 Token 系统
└── types/             — 类型定义
```

核心数据流：

```
Designer: useReducer(designerReducerWithHistory) → state.schema
    ↓ 通过 DesignerContext.Provider 传递给
    ├── Canvas (useDesignerContext)
    └── PropertyPanel (useDesignerContext)

FormRender: useState(formValues, fieldOptions, fieldErrors)
    ↓ 通过 props 传递给
    └── FieldRenderer (接收 value, onChange, eventContext)
```

---

## 3. 发现的问题与优化建议

---

### P0 · Bug

---

### 3.1 ContainerPreview 违反 Hooks 规则

**状态**：✅ 已修复 — 拆分为 6 个独立 React.memo 组件（GenericContainerContent / CardContainerContent / GridContainerContent / TableContainerContent / CollapseContainerContent / TabsContainerContent），所有 hooks 无条件顶层调用。

**文件**：[ContainerPreview.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/ContainerPreview.tsx) (查看: GenericContainerContent, CardContainerContent, GridContainerContent)

**问题**：`ContainerContent` 是一个普通函数（非 React 组件），但在其中调用了 hooks（`useDroppable`、`useMemo`），这些 hooks 被计入父组件 `ContainerPreview` 的 hook 链中。由于内部根据 `field.type` 和 `colSpans/columns/panels/tabs` 的长度做 if-else 分支，不同条件下调用的 hook 数量不同：

- 通用容器 / card 类型：调用 `useDroppable` + `useMemo`
- grid / table / collapse / tabs 类型且子配置为空：调用 `useDroppable`；否则不调用

**Hook 调用顺序在渲染间可能变化**，违反 React Rules of Hooks。

**影响**：当 `colSpans`/`columns`/`panels`/`tabs` 从空变为非空（或反向）时，React 可能抛 `"Rendered fewer hooks than expected"` 错误。

**优化建议**：
- 将 `ContainerContent` 改为独立 React 组件 `<ContainerContent field={field} />`，每个分支独立管理自己的 hooks
- 或给每个条件分支**无条件**调用 `useDroppable`（空容器和非空容器都调用），保证 hooks 数量稳定

---

### P1 · 高性能影响

---

### 3.2 DesignerContext.Provider value 未 memo 化

**状态**：✅ 已修复 — contextValue 使用 `useMemo` 包裹，与 3.6 合并为单个 Provider。

**文件**：[Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx#L383-L395)

**问题**：两个 Provider 的 value 都是内联对象字面量 `{{ dispatch, selectedFieldId, ... }}`，每次 `Designer` 渲染都创建新引用。所有调用 `useDesignerContext()` 的消费者（`Canvas`、`RootFields`、`NestedField`、`FieldItem`、`PropertyPanel` 等）都会不必要的重渲染。

**影响**：这是设计器中**所有组件重渲染的根源**。

**优化建议**（与 3.6 合并）：

```tsx
const contextValue = useMemo(() => ({
  dispatch, selectedFieldId: state.selectedFieldId,
  onSelectField: handleSelectField, scene,
  formConfig: state.schema.form, adapter: canvasAdapter,
  desktopAdapter: widgetsAdapter,
}), [dispatch, state.selectedFieldId, handleSelectField, scene, state.schema.form, canvasAdapter, widgetsAdapter])

// 单个 Provider 包裹 Canvas + PropertyPanel
<DesignerContext.Provider value={contextValue}>
  <Canvas ... />
  <PropertyPanel ... />
</DesignerContext.Provider>
```

---

### 3.3 FormRender 中 $form/eventContext 每帧重建

**状态**：✅ 已修复 — `formValuesRef` render 阶段同步，`$form.values` getter 读 ref，`eventContext` 依赖数组排除 `formValues`，引用稳定。

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx#L82-L193)

**问题**：`$form` 依赖 `formValues`（`values` getter 闭包引用）→ `eventContext` 也依赖 `formValues` → 每次字段输入 → 两个对象都重建 → 所有带 `eventContext` 的 `FieldRenderer` 都重渲染。

**优化建议** — 将 `formValues` 存到 ref，render 阶段同步赋值，`$form.values` getter 读 ref：

```ts
const formValuesRef = useRef(formValues)
formValuesRef.current = formValues

const $form: $Form = useMemo(() => ({
  get values() { return formValuesRef.current },
  setFieldValue,
  ...
}), [setFieldValue, ...])  // formValues 不在依赖中
```

`eventContext` 同理，`formValues` 改用 ref，保持引用稳定。

**注意**：此方案改为 render 阶段直接赋值 `formValuesRef.current = formValues`，原有的两个 ref 同步 `useEffect`（当前文件第 83-88 行）应一并删除，见 3.17。

---

### 3.4 renderNestedField 每次渲染创建新闭包

**状态**：✅ 已修复 — 提取为独立 `NestedFieldRenderer` 组件（React.memo），内部 `handleChange` 用 `useCallback` 稳定。

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx#L334-L361)

**问题**：

```ts
function renderNestedField(field: FormFieldSchema): React.ReactNode {
  const enhancedField = ...
  return <FieldRenderer
    field={enhancedField}
    onChange={(val) => handleFieldChange(field.name, val)}  // 每次渲染新箭头函数
    ...
  />
}
```

`renderNestedField` 是组件内普通函数，每次 `FormRender` 渲染都创建新函数实例。内联 `onChange` 箭头函数每次创建新引用。

**影响**：即使 `FieldRenderer` 加了 `React.memo`，也会因 `onChange` 引用变化无法跳过重渲染。

**优化建议**：提取为独立组件，用 `useCallback` 稳定 `onChange`：

```tsx
const NestedFieldRenderer = React.memo<{ field: FormFieldSchema; ... }>(({ field, ... }) => {
  const handleChange = useCallback(
    (val: unknown) => handleFieldChange(field.name, val),
    [field.name]  // handleFieldChange 引用稳定后，这里也稳定
  )
  return <FieldRenderer field={enhancedField} onChange={handleChange} ... />
})
```

---

### 3.5 FieldRenderer 重复创建内联对象

**状态**：✅ 已修复 — style / eventHandlers / fieldProps 全部用 `useMemo` 缓存。

**文件**：[FieldRenderer.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FieldRenderer.tsx#L56-L147)

**问题**：

1. 第 57 行 `style={{ display: 'block', marginBottom: '...', fontWeight: ... }}` — 每次渲染新 style 对象，触发 DOM 更新
2. 第 82 行 `resolveEvents(field.events, ...)` — 每次渲染创建新 handler 函数闭包
3. 第 112-130 行 `fieldProps = { value, onChange, ...eventHandlers }` — 每次渲染新对象
4. 第 158 行 `React.createElement(renderFn, fieldProps)` — 每次传入新 props

**影响**：即便上层 $form/eventContext 稳定后，FieldRenderer 自身仍会产生新引用。

**优化建议**：
- `style` 对象提取为 `useMemo` 缓存
- `eventHandlers` 用 `useMemo` 缓存（依赖 `[field.events, eventContext, field.type]`）
- `fieldProps` 用 `useMemo` 缓存（将 value / isDisabled / options / eventHandlers 纳入依赖）

---

### P2 · 中等影响

---

### 3.6 Designer 双 Context Provider 实例

**状态**：✅ 已修复 — 与 3.2 合并，Canvas 和 PropertyPanel 统一包裹在单个 `DesignerContext.Provider` 中。

**问题**：Canvas 和 PropertyPanel 分别包裹在**两个独立的 `DesignerContext.Provider`** 中，value 相同但引用不同。两个 context 实例彼此独立，架构上不安全。

**优化建议**：与 3.2 合并 — 单个 Provider + `useMemo` 包裹 value。

---

### 3.7 缺少 React.memo 导致级联重渲染

**状态**：✅ 已修复 — SortableField / NestedField / FieldItem / PaletteItemCard 均已包裹 `React.memo`。

**文件**：
- [RootFields.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/RootFields.tsx#L15-L46) — `SortableField`
- [NestedField.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/NestedField.tsx#L17-L51)
- [FieldItem.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/FieldItem.tsx#L18-L146)
- [FieldList.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/FieldList.tsx#L92-L139) — `PaletteItemCard`

**问题**：以上组件均未用 `React.memo` 包裹，且都读取 `useDesignerContext()`。当 `selectedFieldId` 变化时，所有字段同时重渲染。

**优化建议**（与 3.2 配套，Context value memo 后才能生效）：

```tsx
const SortableField = React.memo<{ field: FormFieldSchema }>(({ field }) => {
  const { selectedFieldId } = useDesignerContext()
  const isSelected = selectedFieldId === field.id
  // ...
})
```

---

### 3.8 useFormDesigner selectedField 不支持嵌套查找（Bug）

**状态**：✅ 已修复 — `selectedField` 改用 `findInTree` 递归搜索整棵树，支持嵌套容器内字段。

**文件**：[hooks.ts](file:///d:/Repos/form_engine/packages/core/src/designer/hooks.ts#L27-L30)

**问题**：

```ts
const selectedField = useMemo(
  () => state.schema.fields.find((f) => f.id === state.selectedFieldId) || null,
  [state.schema.fields, state.selectedFieldId],
)
```

`useFormDesigner` 的 `selectedField` 只用 `Array.find` 搜索顶层 `fields`，**嵌套在容器内的字段无法匹配**。对比之下，`Designer` 组件使用 `findInTree` 递归查找，支持嵌套字段。

**影响**：使用 `useFormDesigner` headless API 时，嵌套容器内的字段选中后 `selectedField` 始终为 null。

**优化建议**：复用 `reducer.ts` 中已导出的 `findInTree`：

```ts
import { findInTree } from './reducer'

const selectedField = useMemo(
  () => state.selectedFieldId ? findInTree(state.schema.fields, state.selectedFieldId) || null : null,
  [state.schema.fields, state.selectedFieldId],
)
```

---

### 3.9 loadDataSource 闭包捕获 formValues 快照

**状态**：✅ 已修复 — 所有 `formValues` 读取均改用 `formValuesRef.current`，避免闭包捕获过期快照。

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx#L216-L246)

**问题**：`loadDataSource` 的 `useCallback` 依赖 `[formValues, ...]`，`setTimeout` 回调中引用的 `formValues` 是**创建 timer 时的闭包快照**，而非 300ms 后请求执行时的实时值。虽然有 `fieldDepsSnapshot` 做过期校验，但 `resolveDataSource` 传入的请求参数本身可能已陈旧。

**优化建议**：将 `formValues` 改用 ref 存储，setTimeout 中读取 `formValuesRef.current`（与 3.3 的 `formValuesRef` 共用）。

---

### 3.10 FormRender visibleFields 每次随 formValues 重算

**状态**：✅ 功能需要，保持现状 — `visibleFields` 依赖 `formValues` 是功能性依赖（动态可见性判断），不应移除。`useMemo` 已保证在值不变时跳过重算。

**问题**：`visibleFields` 的 `useMemo` 依赖 `formValues`，每次输入都重新过滤整个字段列表。如果可见性条件变化，会导致 FieldRenderer 组件 **mount/unmount**（而非仅重渲染），开销更大。当前已用 `useMemo`，无缺失。但可与 3.3 配合优化：

**优化建议**：在 3.3 的 ref 同步方案基础上，将 `visibleFields` 的依赖从 `formValues` 改为通过 `useRef` + 手动比对上次计算结果来判断是否需要重算。或保持现状，因为 `formValues` 引用稳定后 `useMemo` 的命中率已足够高。

---

### 3.11 handleComponentPropsChange 防抖有边缘场景

**状态**：✅ 已实现 — `componentPropsTimerRef` + 300ms setTimeout，函数式更新保证合并正确。

**问题**：防抖设计基本正确 — 函数式 `setLocalComponentProps(prev => ...)` 保证 `prev` 是最新状态，`next` 合并了多次修改。`setTimeout` 中 `next` 是闭包捕获值，每次新调用 `clearTimeout` 只保留最后一次。

但**极端边缘场景**：用户快速修改 key A 的值，300ms 内又修改 key B，dispatch 的是合并 A+B 的完整状态，使用 `next` 闭包值。由于 `next` 是从 `prev`（最新状态）构建的，结果正确。

真正的风险：如果在 300ms 防抖窗口内**同一次 render** 被调用多次（同一 batch），`setLocalComponentProps` 的函数式更新在 React 18 自动批处理下是正确的。当前设计在大多数场景没有问题。

**优化建议**：不是 Bug，但可改进为用 `useRef` 累积待提交的 patch 更清晰：

```ts
const pendingPatchRef = useRef<Record<string, unknown>>({})
// 每次修改合并到 pendingPatchRef，300ms 后一次性 dispatch(nextPatch)
```

---

### P3 · 低影响 / 代码质量

---

### 3.12 findInTree 在拖拽中被多次重复调用

**状态**：⏭️ 已排除 — 涉及建立全局位置索引结构，需单独设计规划。见 [drag-field-index-plan.md](./drag-field-index-plan.md)。

**文件**：[Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx#L197-L228)

**问题**：`handleDragOver` 中每次事件执行 4 次 O(n) 树遍历（`findFieldPosition` ×2 + `findInTree` ×2），`handleDragOver` 在拖拽期间高频触发（~60fps）。

**优化建议**：构建 `Map<id, { parentId, index, field }>` 位置索引，在 schema 变化时更新一次，拖拽时 O(1) 查表。

---

### 3.13 FormRender 状态管理过于耦合

**状态**：⏭️ 已排除 — 大型重构（提取 `useFormRender` hook），需单独规划测试策略。见 [useFormRender-refactor-plan.md](./useFormRender-refactor-plan.md)。

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx)

**问题**：335 行组件，4 个 state + 5 个 callback + 2 个 useMemo + 3 个 useEffect。所有逻辑内聚在一个组件中，职责不单一，难以测试。

**优化建议**：提取 `useFormRender` hook（见[第 4 节](#4-建议提取的-hooks)）。

---

### 3.14 module-level debounceTimers 多实例冲突

**状态**：✅ 已处理 — 模块级 Map 保留为测试导出，每个 FormRender 实例用 `useRef` 独立隔离（`debounceTimersRef`）。

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx#L41-L56)

```ts
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
```

**问题**：模块级单例，多个 `<FormRender>` 实例共享同一 Map，同名字段会互相覆盖定时器。

**优化建议**：移到组件内部用 `useRef<Map>`，每个实例独立。

---

### 3.15 useFormDesigner 与 Designer 状态重复

**状态**：✅ 已修复 — 提取共享 `DEFAULT_SCHEMA` 常量（`hooks.ts` 定义导出，`Designer.tsx` 导入复用）。

**问题**：两处独立初始化相同的默认 schema 对象，代码重复。

**优化建议**：提取 `DEFAULT_SCHEMA` 常量共享。

---

### 3.16 StyleProvider fallback 每次创建新对象

**状态**：✅ 已修复 — 模块级 `cachedDefaultContext` 变量，首次调用后缓存结果。

**问题**：未包裹 `StyleProvider` 时，`useStyleContext()` 每次调用 `createDefaultContext()` 创建新对象 → `useStyle` 的 `useMemo([context])` 每次都重建。

**优化建议**：模块缓存 `createDefaultContext()` 结果。

---

### 3.17 useEffect 依赖缺失 — FormRender ref 同步

**状态**：✅ 已修复 — render 阶段直接赋值 `formValuesRef.current = formValues` / `onChangeRef.current = onChange`，替代原有的 `useEffect`。

**注意**：与 3.3 配套的 ref 同步方案已落地，原有的两个 `useEffect` 已删除。

```ts
useEffect(() => { formValuesRef.current = formValues })    // 无依赖数组，每次渲染后执行
useEffect(() => { onChangeRef.current = onChange })         // 同上
```

**问题**：无依赖数组意味着每次渲染后都执行，虽然开销极小（仅 ref 赋值），但语义不清晰。

**优化建议**：如果采用 3.3 的 render 阶段 ref 同步方案（`formValuesRef.current = formValues`），这两个 `useEffect` 应**直接删除**，不再需要。`onChangeRef` 同理可改为 render 阶段赋值。

---

### 3.18 collectFieldNames 重复实现

**状态**：✅ 已修复 — `reducer.ts` 统一导出 `collectFieldNames`，`PropertyPanel.tsx` 导入使用，无重复实现。
- [reducer.ts](file:///d:/Repos/form_engine/packages/core/src/designer/reducer.ts#L115-L127) — `collectFieldNames(fields, excludeFieldId)`
- [PropertyPanel.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/PropertyPanel.tsx#L77-L87) — `collectFieldNamesExcluding(fields, excludeId)`

**问题**：两个函数逻辑几乎相同（遍历树收集字段名），仅参数名略有差异。

**优化建议**：统一为一个函数，`reducer.ts` 导出，`PropertyPanel.tsx` 引用。

---

### 3.19 ContainerPreview 空容器占位代码重复

**状态**：✅ 已修复 — 提取为独立 `EmptyContainerPlaceholder` React.memo 组件，Grid/Table/Collapse/Tabs 容器复用，消除 5 处重复 JSX。

**问题**：5 处几乎相同的"空容器占位"JSX（droppable div + "拖入组件" 提示文字）：
- 第 72-97 行：通用容器空状态
- 第 173-196 行：grid 空状态
- 第 223-246 行：table 空状态
- 第 296-319 行：collapse 空状态
- 第 351-374 行：tabs 空状态

**优化建议**：提取为 `EmptyContainerPlaceholder` 子组件，接收 `setNodeRef` 和 `isOver` 作为 props。

---

### 3.20 useAdaptiveAdapter 未兼容旧 Safari

**状态**：✅ 已修复 — `addEventListener` / `removeEventListener` 调用前判断，回退到 `addListener` / `removeListener`。

**问题**：使用 `mql.addEventListener('change', handler)` 但没有 `addListener` 兜底。[StyleProvider.tsx](file:///d:/Repos/form_engine/packages/core/src/styles/StyleProvider.tsx#L140-L145) 中有正确示例。

**优化建议**：参照 StyleProvider 加上 `addListener` / `removeListener` 兼容。

---

### 3.21 PropertyPanel 中 formConfig 类型为 any

**状态**：⏭️ 已排除 — 全项目 32 处 `: any` / 15 处 `as any` 分布在 12 个文件，需单独规划类型替换工程。见 [any-type-replacement-plan.md](./any-type-replacement-plan.md)。

**问题**：
- 第 28 行：`formConfig: any`
- 第 67 行：`w: any`
- 第 73 行：`customConfig: any`

全项目共 32 处 `: any` / 15 处 `as any`，分散在 12 个文件中。

**优化建议**：渐进式替换为精确类型。优先处理 `PropertyPanel`（用户直接接触的接口）。

---

### 3.22 CanvasToolbar 每次渲染创建新数组

**状态**：✅ 已修复 — 提取为模块级常量 `SCENE_TOGGLES`。

**问题**：每次渲染都创建新数组 `[{ key: 'desktop', ... }, { key: 'mobile', ... }]` 并 `.map()`。

**优化建议**：提取为模块级常量 `SCENE_TOGGLES`。

---

### 3.23 Designer selectedField 每次都执行 findInTree

**状态**：⏭️ 已排除 — 当前规模下收益可忽略（树通常不超过几十个节点），保持现状。

**问题**：每次渲染都执行 O(n) 树遍历，即使 `selectedFieldId` 没变。

**优化建议**：当前规模下开销很小（树通常不超过几十个节点），加 `useMemo` 依赖 `state.schema.fields` 的收益有限——reducer 每次返回新 state，`fields` 引用也变了，`useMemo` 几乎不会命中缓存。当前写法是可接受的，若未来树规模增大可考虑建立 `Map<id, field>` 索引。

---

## 4. 建议提取的 Hooks

| Hook 名称 | 源文件 | 职责 | 受益组件 | 状态 |
|-----------|--------|------|---------|------|
| `useFormRender` | `FormRender.tsx` | 表单状态管理、数据源、校验一体化 | `FormRender` | ⏭️ 见 [独立规划](./useFormRender-refactor-plan.md) |
| `useFormValidation` | `FormRender.tsx` + `validate.ts` | 校验逻辑封装 | `FormRender` | 📋 待规划 |
| `useDataSource` | `FormRender.tsx` | 数据源加载、缓存、依赖追踪 | `FormRender` | 📋 待规划 |
| `useDragHandlers` | `Designer.tsx` | DnD 事件处理合并（dragStart/Over/End/Cancel） | `Designer` | 📋 待规划 |
| `useFieldEvents` | `FieldRenderer.tsx` | 事件处理器解析 & 缓存 | `FieldRenderer` | ✅ 3.5 已在 FieldRenderer 中 `useMemo` 内联实现 |
| `useContainerDrop` | `ContainerPreview.tsx` | 容器拖放逻辑 | `ContainerPreview` | ✅ 3.1 已拆分为独立组件，useDroppable 在各组件内独立管理 |

---

## 5. 验证步骤

**P0 · ContainerPreview hooks 修复**（✅ 已验证）：
- 在不同容器类型（card→grid→tabs→collapse）之间切换，确认无 "Rendered fewer hooks" 错误
- 添加/删除 grid columns、collapse panels，确认无崩溃

**P1 · 渲染性能优化**（✅ 已修复，建议 Profiler 确认）：
- 使用 React DevTools Profiler 录制拖拽排序、选中字段、表单输入操作
- 确认单个字段输入时，只有当前 FieldRenderer 重渲染（而非全部）
- 确认选中字段时，只有目标字段高亮重渲染（而非全部 SortableField）
- 确认联动逻辑（`$form.setFieldValue`）仍然正常

**P2 · 功能正确性**（✅ 已修复）：
- 使用 `useFormDesigner` 选中嵌套容器内字段，确认 `selectedField` 不为 null
- 快速输入联动字段，确认 dataSource 请求参数正确
- 快速连续修改 componentProps 多个 key，确认最终 dispatch 值正确

**P3 · 代码质量**（✅ 已修复，建议运行检查）：
- 运行 `pnpm test` 确认现有测试通过
- 运行 `pnpm build` 确保无编译/类型错误
- 运行 `pnpm check:tokens` 确保主题 Token 合规