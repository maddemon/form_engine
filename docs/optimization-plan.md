# Form Engine 代码优化计划

> 生成日期: 2026-06-13
> 范围: packages/core + packages/adapter-antd + packages/adapter-antd-mobile
> 约束: 仅规划，不修改代码

---

## 一、性能优化

### 1.1 Context 值未 memoize 导致级联重渲染

**文件**: `packages/core/src/designer/Designer.tsx:216-218`

Designer 共有 6 个 Context Providers，其中 `DispatchContext`（L201）、`SelectionContext`（L202）、`ConfigContext`（L219，使用 `configCtx`）已正确使用 `useMemo`，但以下 3 个每次渲染创建新对象字面量，所有消费者即使值未变也会重渲染：

```tsx
<DesignerSceneContext.Provider value={{ scene }}>              // L216
<DesignerFormConfigContext.Provider value={{ formConfig }}>    // L217
<DesignerAdapterContext.Provider value={{ adapter: canvasAdapter, ... }}> // L218
```

**计划**: 用 `useMemo` 包裹这三个 value，与已有的 `dispatchCtx`、`selectionCtx`、`configCtx` 保持一致。

---

### 1.2 useWidgets 每次渲染创建新对象

**文件**: `packages/core/src/designer/PropertyPanel/index.tsx:44-46`

```ts
function useWidgets(designerWidgets?) {
  return { ...defaultDesignerWidgets, ...designerWidgets }
}
```

新对象引用导致 `PropertyPanelInner`、`DefaultPropertyContent`、`AdvancedSection`、`EventEditor` 等级联重渲染。

**计划**: 用 `useMemo` 缓存合并结果，deps 为 `[designerWidgets]`。

---

### 1.3 TreeNode 未 React.memo 包裹

**文件**: `packages/core/src/designer/Canvas/ComponentTree.tsx:28`

`TreeNode` 是递归组件，当前未 memoize。选中态变化时整个组件树全部重渲染。

此外，该组件存在大量内联 style 对象（L34-42、L74-88），每次渲染都创建新对象，即使添加 `React.memo` 也会因 style 引用变化而失效。

**计划**: 
1. 用 `React.memo` 包裹 `TreeNode`，确保 `onSelect` 等回调引用稳定（`useCallback`）
2. 将内联 style 提取为模块级常量或 `useMemo` 缓存

---

### 1.4 cloneField 双重 clone children

**文件**: `packages/core/src/designer/reducer/fieldOperations.ts:24-29`

```ts
export function cloneField(field: FormFieldSchema): FormFieldSchema {
  return {
    ...structuredClone(field),       // 深克隆整个子树
    id: generateFieldId(),
    children: field.children.map(cloneField),  // 每个 child 再克隆一次
  }
}
```

children 被 `structuredClone` 克隆一次，又被 `cloneField` 递归克隆一次。

**计划**: 二选一：要么只用 `structuredClone` + 替换 ID；要么只用递归 `cloneField`，不用 `structuredClone`。

---

### 1.5 collectFieldNames 修改 name 时全树遍历

**文件**: `packages/core/src/designer/reducer/index.ts:58-70, 148-151`

`handleUpdateField` 在 `action.patch.name` 为 truthy 时调用 `collectFieldNames`（O(n) 递归），仅用于查重。并非每次 UPDATE_FIELD 都触发，但编辑 name 字段时每次按键都会全树遍历。

**计划**: 在 state 或 FieldIndex 中维护一个 `Set<string>`（字段名集合），增量更新。

---

### 1.6 cloneFields 对整个 schema 深克隆

**文件**: `packages/core/src/designer/reducer/index.ts:213`

每次 snapshot 操作对整个字段树 `structuredClone`，保留最近 50 个快照。大表单下内存开销显著。

**计划**:
- 短期: 考虑只快照变化路径（structural sharing），而非整棵树
- 长期: 引入 immutable 数据结构或 patch/delta 方案

---

### 1.7 useDebouncedFieldUpdate / useDebouncedInput / useDebouncedObjectMap 逻辑重复

**文件**:
- `packages/core/src/designer/hooks/useDebouncedFieldUpdate.ts`（91 行）
- `packages/core/src/designer/hooks/useDebouncedInput.ts`（118 行，包含 2 个 hook）

三个 hook 实现相同模式：local state + timer ref + isEditing ref + 外部同步 effect + cleanup。

**计划**: 提取为通用 `useDebouncedState<T>(externalValue, onCommit, options)` hook，然后组合出三个专用 hook。

---

### 1.8 FieldItem 内联函数

**文件**: `packages/core/src/designer/FieldItem/FieldItem.tsx:46-48`

`onMouseEnter`/`onMouseLeave`/`onClick` 每次渲染创建新函数。虽然组件有 `React.memo`，但 memo 失效时仍会重建。

**计划**: 用 `useCallback` 包裹事件处理函数。

---

### 1.9 FormRender 内联 style 对象

**文件**: `packages/core/src/renderer/FormRender.tsx:233`

```tsx
style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}
```

每次渲染创建新 style 对象。

**计划**: 提取为 `useMemo` 或模块级常量。

---

### 1.10 handleFormSubmit 无意义包装

**文件**: `packages/core/src/renderer/FormRender.tsx:192-194`

```ts
const handleFormSubmit = () => { handleSubmit() }
```

`handleSubmit` 已经是 `useCallback` 稳定引用，这个包装多余。

**计划**: 直接传 `handleSubmit` 作为 `onSubmit`。

---

### 1.11 Canvas 内联 onClick

**文件**: `packages/core/src/designer/Canvas/Canvas.tsx:111`

```tsx
onClick={() => onSelectField(null)}
```

**计划**: 用 `useCallback` 包裹。

---

### 1.12 EventHandlerEditor 多个内联回调

**文件**: `packages/core/src/designer/PropertyPanel/EventHandlerEditor.tsx:98, 111-112, 120, 131`

多处内联箭头函数导致子组件重渲染。

**计划**: 提取为 `useCallback` handler。

---

### 1.13 SCENE_TOGGLES 在渲染函数内定义

**文件**: `packages/core/src/designer/Canvas/CanvasToolbar.tsx:26-29`

常量数组定义在 render 函数体内。

**注意**: `CanvasToolbar` 已被 `React.memo` 包裹（L21），因此 `SCENE_TOGGLES` 仅在 props 变化时重建，实际影响极小。优先级 P3，可忽略。

**计划**: 提取到模块作用域。非必要优化。

---

### 1.14 useFieldProps 的 $self 对象频繁重建

**文件**: `packages/core/src/renderer/hooks/useFieldProps.ts:49-61`

`$self` 已用 `useMemo` 包裹，但依赖 `[value, field, isDisabled]`，其中 `value` 每次按键变化导致 `$self` 新引用，进而触发 `resolveEvents` 重算。

**计划**: 当 `field.events` 为空时短路 `resolveEvents`；或将 `value` 通过 ref 传递以避免不必要的引用变化。

---

### 1.15 PalettePanel 冗余调用 getFullPaletteGroups

**文件**: `packages/core/src/designer/PalettePanel/PalettePanel.tsx:24`

Designer 已计算 `finalGroups = getFullPaletteGroups(excludeTypes)` 并传入 `groups` prop，但 PalettePanel 内部又调用了一次。

**计划**: 信任父组件传入的 `groups` prop，仅在 `groups` 为 undefined 时才 fallback 调用。

---

### 1.16 EventEditor .map() 内 inline onChange

**文件**: `packages/core/src/designer/PropertyPanel/EventEditor.tsx:46-59`

`.map()` 中为每个事件项创建新的 `onChange` 引用。

**计划**: 提取为 `useCallback`，以事件名为参数分发。

---

### 1.17 FormRender visibleFields.map 内联 style

**文件**: `packages/core/src/renderer/FormRender.tsx:237`

```tsx
style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}
```

每个字段渲染时都创建新的 style 对象。字段数量多时（如 50+ 字段），性能影响明显。

**计划**: 提取为 `useMemo` 或根据 `colSpan` 缓存 style 对象。

---

### 1.18 ComponentTree TreeNode 内联 style

**文件**: `packages/core/src/designer/Canvas/ComponentTree.tsx:34-42, 74-88`

TreeNode 组件内有多处内联 style 对象：
- L34-42: 节点容器的 padding、background、color 等
- L74-88: 弹出层的 position、width、padding 等

即使添加 `React.memo`，这些内联 style 也会导致 memo 失效。

**计划**: 提取为模块级常量或 `useMemo` 缓存。

---

### 1.19 handleAddField 内联递归函数

**文件**: `packages/core/src/designer/reducer/index.ts:87-91`

```ts
const addToParent = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
  nodes.map(n => {
    if (n.id === action.parentId) return { ...n, children: [...n.children, fieldToAdd] }
    return { ...n, children: addToParent(n.children) }
  })
```

每次 `ADD_FIELD` action 都创建新的递归闭包函数。与 2.6 相关但属于性能维度。

**计划**: 复用 `insertIntoTree`（见 3.6），避免每次创建闭包。

---

### 1.20 PropertyPanel 子树缺少 React.memo

**文件**: `packages/core/src/designer/PropertyPanel/` 下多个组件

PropertyPanel 整棵子树未用 `React.memo` 包裹，选中字段变化时全部重渲染：

- `DefaultPropertyContent.tsx:47`
- `AdvancedSection.tsx:25`
- `RulesEditor.tsx:41`
- `StaticExpressionToggle.tsx:30`
- `EventHandlerEditor.tsx:40`
- `EventEditor.tsx:28`

此外，`Canvas.tsx:55`、`ComponentTree.tsx:56`、`ContainerPreview.tsx:48`、`RegionPreview.tsx:30`、`RootFields/index.tsx:23`、`FormRender.tsx:142`（FormRenderInner）等组件同样缺少 memo。

**计划**: 对上述组件逐一添加 `React.memo`，同时确保传入的回调引用稳定（配合 `useCallback`）。

---

## 二、功能性 Bug

### 2.1 useDataSource 空依赖 useEffect 导致 static 数据源不加载

**文件**: `packages/core/src/renderer/hooks/useDataSource.ts:77-89`

```ts
useEffect(() => {
  formSchema.fields.forEach((field) => {
    if (!field.dataSource) return
    if (field.dataSource.type === 'static') {
      loadDataSource(field, 0)
    } else if (field.dataSource.type === 'remote') {
      if (checkRequiredDeps(field.dataSource, formValues)) {
        loadDataSource(field, 0)
      }
    }
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

第一个 useEffect 依赖数组为空 `[]`，负责初始加载所有数据源（static + remote）。第二个 useEffect（L91-100）依赖 `[formValues, formSchema.fields, loadDataSource]`，但只处理 remote 类型。因此：**如果 schema 动态新增 static 数据源字段，其数据源永远不会被加载**（第一个 effect 不会重跑，第二个 effect 忽略 static）。

**计划**: 在第一个 effect 的依赖中加入 `formSchema.fields`（或用 ref 追踪后按需触发），确保 static 数据源在 schema 变化时也能加载。

---

### 2.2 useDebouncedFieldUpdate isEditingRef 切换字段时未重置

**文件**: `packages/core/src/designer/hooks/useDebouncedFieldUpdate.ts:45, 62-66`

`isEditingRef` 是一个跨渲染持久化的 ref，在用户编辑期间为 `true`，debounce timer 触发后重置为 `false`。当在 PropertyPanel 中切换不同字段时，`fieldId` 变化重建 `handleChange`，但 `isEditingRef.current` 保持 `true`（旧字段的编辑状态）。随后 sync effect（L62-66）检测到 `isEditingRef.current = true`，跳过 `setLocalValue(externalValue)`，导致新字段的外部值不会同步到本地 state — 用户看到的仍是旧字段的值，直到旧 timer 触发重置。

**计划**: 在 `fieldId` 或 `key` 变化时重置 `isEditingRef.current = false`，确保切换字段后 sync effect 正常执行。

---

## 三、代码重复

### 3.1 Container ID 正则解析重复 3 处

**文件**:
- `packages/core/src/designer/Dnd/handleDragOver.ts:43-44, 54-55`
- `packages/core/src/designer/Dnd/computeDropTarget.ts:28, 37-38`
- `packages/core/src/designer/Dnd/positionResolver.ts:24, 32`

同一正则 `overId.match(/^(.+)__region_(\w+)$/)` 和 `overId.replace(/__container$/, '')` 重复出现。

**计划**: 提取到 `positionResolver.ts` 共享工具函数 `parseOverId(overId)`。

---

### 3.2 isTimeFormat 重复 3 处

**文件**:
- `packages/adapter-antd/src/components/DatePicker.tsx:20`
- `packages/adapter-antd-mobile/src/components/DatePicker.tsx:7`
- `packages/adapter-antd-mobile/src/components/DateRange.tsx:7`

完全相同的正则函数。

**计划**: 提取到 `@form-engine/core/utils` 或 adapter 共享模块。

---

### 3.3 formatDate 重复

**文件**:
- `packages/adapter-antd-mobile/src/components/DatePicker.tsx:11-13`
- `packages/adapter-antd-mobile/src/components/DateRange.tsx:11-13`

完全相同的日期格式化函数。

**计划**: 提取到 mobile adapter 的 `utils.ts`（已存在）。

---

### 3.4 resolveChildOptions 重复

**文件**:
- `packages/adapter-antd/src/components/SubForm.tsx:38-45`
- `packages/adapter-antd-mobile/src/components/SubForm.tsx:54-61`

完全相同的选项解析逻辑。

**计划**: 提取为共享工具函数。

---

### 3.5 PropertyPanel 重新实现 hasCategory 判断

**文件**: `packages/core/src/designer/PropertyPanel/index.tsx:71-73`

```ts
const isForm = Array.isArray(category) ? category.includes('form') : category === 'form'
const isContainer = Array.isArray(category) ? category.includes('container') : category === 'container'
const isButton = Array.isArray(category) ? category.includes('button') : category === 'button'
```

`components/utils.ts` 已有 `isFormComponent()`、`isContainerComponent()` 等工具函数。

**计划**: 直接使用已有的工具函数。

---

### 3.6 handleAddField 内联递归 vs insertIntoTree

**文件**: `packages/core/src/designer/reducer/index.ts:87-91`

`handleAddField` 手写递归插入逻辑，与 `fieldOperations.ts` 的 `insertIntoTree` 几乎一致。

**计划**: 复用 `insertIntoTree`。

---

### 3.7 Adapter 包间组件结构重复

两个 adapter 包的 `FormItem`、`FormWrapper`、`Grid`、`Flex`、`Html`、`Image`、`Alert`、`Button`、`Card`、`Divider`、`Text`、`Title`、`Upload` 等组件结构高度相似，仅 UI 库不同。

**计划**: 当前已通过 `createAdapterComponent` 抽象了一部分，剩余纯适配组件可考虑：
- 短期: 保持现状（两包独立维护）
- 长期: 探索更深层的模板化方案（如配置驱动渲染）

---

### 3.8 useDebouncedObjectMap 与防抖 hook 模式重复

**文件**: `packages/core/src/designer/hooks/useDebouncedInput.ts:73-118`

`useDebouncedObjectMap` 与 `useDebouncedInput`、`useDebouncedFieldUpdate` 共享相同模式：local state + timer ref + isEditing ref + 外部同步 effect + cleanup。

**计划**: 与 1.7 合并处理，提取通用 `useDebouncedState` 后统一实现。

---

### 3.9 Tabs/Collapse 容器 children 渲染模式重复

**文件**:
- `packages/adapter-antd-mobile/src/components/Tabs.tsx:56-65`
- `packages/adapter-antd-mobile/src/components/Collapse.tsx:42-53`

"按 regionKey 过滤 schemaChildren 并用 adapter.components 渲染"的模式完全相同：

```tsx
schemaChildren.filter((c) => c.regionKey === tab/panel.key)
  .map((child) => {
    const renderFn = adapter?.components[child.type]
    return renderFn ? React.createElement(renderFn, { fieldSchema: child, key: child.id } as any)
      : <React.Fragment key={child.id}>{defaultFieldRenderer(...)}</React.Fragment>
  })
```

**计划**: 提取为共享的 `renderSchemaChildren(adapter, children, regionKey)` 工具函数。

---

## 四、类型安全

### 4.1 `as any` 类型断言

**文件**: `packages/core/src/renderer/useAdaptiveAdapter.ts:35, 43`

```ts
(mql as any).addListener?.(handler)
(mql as any).removeListener?.(handler)
```

**计划**: 定义 `LegacyMQL` 接口替代 `any`。

---

### 4.2 React.ComponentType\<any\> 泛滥

**文件**:
- `packages/core/src/types/adapter.ts:127`（jsxScope）
- `packages/core/src/renderer/FormRender.tsx:34`
- `packages/core/src/designer/PropertyPanel/StaticExpressionToggle.tsx:25`
- `packages/core/src/registry/simpleCustomComponentRegistry.ts:92, 117`
- `packages/adapter-antd-mobile/src/components/Radio.tsx:16, 21`
- `packages/adapter-antd-mobile/src/components/Checkbox.tsx:58`

**计划**: 统一使用 `React.ComponentType<Record<string, unknown>>` 或为各场景定义专用 Props 接口。

---

### 4.3 onChange 回调参数类型为 any

**文件**: `packages/core/src/types/component.ts:55`

```ts
onChange?: (value: any) => void
```

**计划**: 改为 `unknown`。

---

### 4.4 ESLint 配置关闭了 no-explicit-any

**文件**: `eslint.config.mjs:172`

```js
'@typescript-eslint/no-explicit-any': 'off',
```

**计划**: 逐步收紧为 `'warn'`，优先修复 adapter 包中的 `any`。

---

### 4.5 collectFieldNames 中 name 可能为 undefined

**文件**: `packages/core/src/designer/reducer/index.ts:63`

```ts
names.add(f.name)
```

`FormFieldSchema.name` 是可选字段，可能为 `undefined`。将 `undefined` 加入 `Set<string>` 类型不严谨，且可能导致查重逻辑异常。

**计划**: 添加空值检查：`if (f.name) names.add(f.name)`。

---

### 4.6 容器组件 fieldSchema as any — 类型定义缺失

**文件**:
- `packages/adapter-antd-mobile/src/components/Tabs.tsx:17, 61`
- `packages/adapter-antd-mobile/src/components/Collapse.tsx:17, 49`
- `packages/adapter-antd-mobile/src/components/SubForm.tsx:20, 117`

三个容器组件均使用 `(fieldSchema as any)?.children` 获取子字段，根因是 `CollapseProps`/`TabsProps` 等类型定义中缺少 `fieldSchema` 字段。这不是简单的 `as any` 清理问题，而是公共类型定义的缺陷。

此外，adapter 包中 `any` 滥用范围远超文档已列项：adapter-antd-mobile 约 24 处（Cascader、TreeSelect、TimePicker、Segment、Select、DatePicker、DateRange 等），adapter-antd 约 7 处（TreeSelect、Cascader、Text、Title 等）。

**计划**: 在公共类型（如 `CollapseProps`/`TabsProps`）中增加 `fieldSchema?: FormFieldSchema` 字段，从根源消除 `as any`。

---

## 五、Reducer 架构

### 5.1 Reducer 未使用 FieldIndex

所有 handler 执行 O(n) 树遍历（`findInTree`、`removeFieldById`、`updateFieldInTree`、`collectFieldNames`），但 FieldIndex 在组件层单独构建。

**计划**: 将 FieldIndex 纳入 reducer state（或作为参数传入），查找操作降为 O(1)。

---

### 5.2 findInTree fallback 滥用

**文件**: 多处 Dnd 模块

`fieldIndex.get(id)?.field ?? findInTree(fields, id)` — 如果 FieldIndex 始终最新，fallback 不应触发。

**计划**: 审计 FieldIndex 的构建时机，修复根因，移除不必要的 fallback。

---

## 六、内存泄漏

### 6.1 useDataSource debounce timer 未清理

**文件**: `packages/core/src/renderer/hooks/useDataSource.ts:40-73`

`debounceTimersRef` 中的 `setTimeout` 在组件卸载时未清理。虽然 `loadDataSource` 内部会清理旧 timer，但如果组件卸载时还有 pending timer，回调仍会执行 `setFieldOptions`（对已卸载组件的 setState）。

**计划**: 在 `useEffect` 的 cleanup 中清理所有 pending timer。

---

### 6.2 StyleProvider CSS 变量未清理

**文件**: `packages/core/src/styles/StyleProvider.tsx:173-187`

CSS 变量注入的 cleanup 函数被注释掉（`// removeCssVariables(prefix)`），多次挂载/卸载 StyleProvider 会累积 CSS 变量残留。

**计划**: 恢复 cleanup 逻辑，或评估是否需要清理。

---

## 七、测试覆盖

### 7.1 adapter 包无测试

`packages/adapter-antd/` 和 `packages/adapter-antd-mobile/` 完全没有测试。

**计划**: 优先为以下组件添加测试：
- SubForm（逻辑最复杂）
- Select / Radio / Checkbox（选项处理）
- DatePicker / DateRange（日期格式化）

---

### 7.2 core 包测试缺口

**已有测试**（10 个文件）:
- reducer、FormRender、JsxRender、useFormValidation、useFormValues、useVisibility、positionResolver、custom-component、resolver、resolvePanelWidth

**缺失测试**:
- Designer 组件（Context 注入、布局渲染）
- PalettePanel / Canvas / ComponentTree
- PropertyPanel 及其子组件
- useFieldExpression / useFieldProps hooks（联动表达式核心逻辑）
- 主题 token 系统
- 校验规则执行逻辑

**计划**: 优先为 reducer 的新改动补充测试，然后覆盖 hooks 层。

---

## 八、实施优先级

| 优先级 | 类别 | 项 | 影响 |
|--------|------|-----|------|
| P0 | Bug | 2.1 useDataSource 空依赖 useEffect | 动态字段数据源不加载 |
| P0 | Bug | 2.2 isEditingRef 切换字段未重置 | 旧字段值显示在新字段上 |
| P0 | 性能 | 1.1 Context memoize | 大量组件级联重渲染 |
| P0 | 性能 | 1.4 cloneField 双重 clone | 每次复制操作 2x 内存 |
| P1 | 性能 | 1.5 collectFieldNames O(n) | 编辑 name 时全树遍历 |
| P1 | 性能 | 1.2 useWidgets 新对象 | PropertyPanel 级联重渲染 |
| P1 | 性能 | 1.3 TreeNode memoize + 内联 style | 大表单选中态卡顿 |
| P1 | 性能 | 1.20 PropertyPanel 子树无 React.memo | 选中字段变化级联重渲染 |
| P1 | 性能 | 1.6 cloneFields 全树快照 | 50 快照内存开销 |
| P1 | 性能 | 1.17 FormRender map 内联 style | 字段多时性能影响 |
| P1 | 重复 | 3.1 Container ID 正则 3 处 | 维护负担 |
| P1 | 重复 | 3.2 isTimeFormat 3 处 | 维护负担 |
| P1 | 类型 | 4.1 as any | 类型安全 |
| P1 | 类型 | 4.5 name undefined | 类型安全 + 逻辑隐患 |
| P1 | 类型 | 4.6 fieldSchema as any 类型定义缺失 | 根因未解决，3+ 处强转 |
| P2 | 性能 | 1.7-1.16, 1.18-1.19 其余性能项 | 各自独立 |
| P2 | 重复 | 3.3-3.9 其余重复项 | 各自独立 |
| P2 | 类型 | 4.2-4.4 其余类型项 | 各自独立 |
| P2 | 架构 | 5.1-5.2 Reducer FieldIndex | 架构改进 |
| P2 | 泄漏 | 6.1-6.2 内存泄漏 | 卸载后 setState / 样式残留 |
| P3 | 测试 | 7.1-7.2 测试覆盖 | 长期质量 |
