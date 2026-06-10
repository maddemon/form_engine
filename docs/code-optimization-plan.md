# 代码优化计划 — Form Engine

> 基于对 `packages/core/src` 的完整分析，按优先级分为三大类：**性能问题**、**重复逻辑（可提取为 Hooks）**、**职责过重的页面/组件**。

---

## 当前状态

- 已完成：`P0`、`P1`、`P3`、`P4`、`H1`、`H2`、`H3`、`H4`、`P5`、`S2`、`S3`、`S4`、`H5` 的核心改造已经落地。
- 仍需验证：`designerReducerWithHistory` 是否需要进一步改为增量历史/structural sharing。
- 保留：`P2`、`S1`、`S5` 作为下一阶段重点优化项（架构级改动，回归风险较高，本轮未启动）。

---

## 一、性能问题

### P0：`allFields.map().filter()` 在 JSX 中重复执行 4 次

**文件**: `packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx` (L175, L234, L243, L255)

```tsx
// 每次渲染创建 4 次新数组
fieldNames={allFields.map((f) => f.name).filter(Boolean)}  // × 4
```

**影响**: 每次 PropertyPanel 重渲染（包括字段选中、输入变化），都重新创建 4 个数组。  
**修复**: 提取为 `useMemo`：

```tsx
const fieldNames = useMemo(() => allFields.map((f) => f.name).filter(Boolean), [allFields])
```

---

### P1：`DesignerInner` 选中变化触发整棵 Designer 树重渲染

**文件**: `packages/core/src/designer/Designer.tsx`

`content` 变量在每次渲染时重新构建整个 JSX 树（FieldList + Canvas + PropertyPanel）。当用户点击选中/取消选中字段时，`selectionCtx` 变化可能导致多个 Consumer 重新渲染。

**当前状态**: 已完成收尾优化。

具体改动：

- 内联样式（根容器、画布外壳、滚动条 CSS、拖拽幽灵元素）已提取为模块级常量 `ROOT_CONTAINER_STYLE` / `CANVAS_WRAPPER_STYLE` / `SCROLLBAR_CSS` / `DRAG_GHOST_BASE_STYLE` / `DRAG_GHOST_ICON_STYLE`，避免每次渲染重新创建对象 / 字符串。
- 拖拽悬浮预览抽成独立组件 `DragGhost`（`React.memo` 包裹），将 `useStyle().token` 消费下沉到 `DragGhost` 内部，让 `selectionCtx` / `configCtx` 变化时不再重建整棵 `DragOverlay` 树。
- `content` JSX 整体用 `useMemo` 缓存，依赖列表显式枚举所有需要响应变化的变量（context、reducer state、dnd state、history 标志等）。

**附加**: 修复了 `useContainerHooks.ts` 的 pre-existing import 路径 bug（`'../types/schema'` → `'../../types/schema'`）。

---

### P2：`designerReducerWithHistory` 每次快照深拷贝全部字段

**文件**: `packages/core/src/designer/reducer.ts` (L211-215)

```ts
const nextSnapshots = [...trimmed, cloneFields(next.schema.fields)]
```

**影响**: 每次 ADD/REMOVE/MOVE/UPDATE/COPY/REORDER 操作都 `structuredClone` 整棵树。对于大型表单（50+ 字段），每次操作可能有明显卡顿。  
**修复**:

- 引入 Immutable.js 或 Immer 的 structural sharing，避免全量克隆
- 或改用增量历史（记录 diff 而非快照）

---

### P3：`NestedField` 中 `mergeJsxScope` 每次渲染都执行

**文件**: `packages/core/src/designer/NestedField.tsx` (L35-38)

```tsx
const designerJsxScope = useMemo(
  () => mergeJsxScope(desktopAdapterCtx, adapter, adapter.scene),
  [desktopAdapterCtx, adapter],
)
```

`mergeJsxScope` 合并 adapter 的 JSX scope，但 adapter 引用在大多数场景下不变。然而 `adapter` 对象在 `DesignerInner` 的 `configCtx` 中每次 scene 变化都会新建。

**当前状态**: 已通过 useMemo 缓存，依赖 `[desktopAdapterCtx, adapter]` 均来自已 memo 化的 Context，scene 切换以外不会重新计算。进一步优化（缓存到 adapter 层面）的收益有限，本轮不处理。

---

### P4：`Canvas` 中 `buildTreeData` 全树遍历

**文件**: `packages/core/src/designer/Canvas.tsx` (L40-47, L58)

```tsx
const treeData = useMemo(() => buildTreeData(fields), [fields])
```

虽然有 `useMemo`，但 `fields` 每次 reducer 变化都是新引用。ComponentTree 面板仅在 `showTree=true` 时使用。

**影响**: 每次字段变更都执行树遍历，即使 ComponentTree 未展开。  
**修复**: 延迟计算 —— 仅在 `showTree` 为 true 时构建 `treeData`。
**当前状态**: 该优化已落地，当前代码已改为 `useMemo(() => (showTree ? buildTreeData(fields) : []), [showTree, fields])`。

---

### P5：`componentProps` 防抖逻辑内联在组件中

**文件**: `packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx` (L108-142)

手动管理 `localComponentProps` state + `componentPropsTimerRef` + `isEditingComponentPropsRef`，逻辑复杂且容易出错。

**当前状态**: 已完成。

- 新增 `useDebouncedObjectMap<T>(externalValue, onChange, delay)` Hook（位于 `useDebouncedInput.ts`），封装"对象键值对 + 防抖"模式。
- `ComponentPropsSection` 已切换为使用 `useDebouncedObjectMap`，消除原内联 state / ref / timer 逻辑。

---

### P6：`FormConfigPanel` 每次渲染创建大量内联对象

**文件**: `packages/core/src/designer/FormConfigPanel.tsx` (L23-46, L62-68, L80-104)

`layoutDesktop`、`layoutMobile`、`labelAlign`、`variants`、`requiredMark` 等选项数组每次渲染都重建。

**影响**: 轻微性能浪费 + GC 压力。  
**修复**: 将这些常量数组提取到模块级别或用 `useMemo`。

---

## 二、重复逻辑 → 可提取为 Hooks / 公共组件

### H1：Container 容器组件的重复结构

**涉及文件**:

- `CardContainerContent.tsx`
- `GenericContainerContent.tsx`
- `FlexContainerContent.tsx`

这三个组件共享相同的模式：

```tsx
const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
const droppableStyle = useDroppableStyle(isOver, hasChildren)
// ... empty check ...
// ... SortableContext + NestedField.map ...
```

**建议**: 提取 `useContainerDroppable(field)` hook：

```ts
function useContainerDroppable(field: FormFieldSchema) {
  const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const hasChildren = field.children.length > 0
  const droppableStyle = useDroppableStyle(isOver, hasChildren)
  return { setNodeRef, childIds, hasChildren, droppableStyle }
}
```

**当前状态**: 已提取 `useContainerDroppable` 并在 `CardContainerContent` / `GenericContainerContent` / `FlexContainerContent` 中使用。

---

### H2：Grid 和 SubForm 的 `childrenByColumn` 分组逻辑完全相同

**文件**:

- `GridContainerContent.tsx` (L17-25)
- `SubFormContainerContent.tsx` (L16-24)

```tsx
// 两个文件中完全相同的逻辑
const childrenByColumn = useMemo(() => {
  const map: Record<number, FormFieldSchema[]> = {}
  for (const child of field.children) {
    const colIdx = (child.columnIndex ?? child.regionKey) ? Number(child.regionKey ?? child.columnIndex) : 0
    if (!map[colIdx]) map[colIdx] = []
    map[colIdx].push(child)
  }
  return map
}, [field.children])
```

**建议**: 提取为 `useChildrenByColumn(children: FormFieldSchema[])` hook。

**当前状态**: 已提取 `useChildrenByColumn` 并在 `GridContainerContent` / `SubFormContainerContent` 中复用。

---

### H3：Collapse 和 Tabs 的 Region 分组逻辑几乎完全相同

**文件**:

- `CollapseContainerContent.tsx` (L15-25)
- `TabsContainerContent.tsx` (L15-25)

两者都是：从 `componentProps` 取出 panels/tabs 数组 → 过滤 → 按 `regionKey` 过滤 children → 创建 RegionDroppable。

**建议**: 提取为 `useRegionGroups(field, configKey)` hook，或合并为一个 `SelfRenderedRegionContent` 组件。
**当前状态**: 已提取 `SelfRenderedRegionContent`，`CollapseContainerContent` / `TabsContainerContent` 已复用。

---

### H4：`resolveSlot('expressionEditor', ...)` 重复调用

**文件**:

- `DefaultPropertyContent.tsx` L71
- `RulesEditor.tsx` L43
- `EventHandlerEditor.tsx` L59

每次都 `useMemo(() => resolveSlot(...), [slots, w])`。

**建议**: 提取 `useSlot(name: string, slots?, widgets?)` hook：

```ts
function useSlot(name: string, slots?: PropertySlots, widgets?: DesignerWidgets) {
  return useMemo(() => resolveSlot(name, slots, widgets), [name, slots, widgets])
}
```

**当前状态**: 已提取 `useSlot` 并在 `DefaultPropertyContent` / `RulesEditor` / `EventHandlerEditor` 中使用。

---

### H5：`useDebouncedInput` + dispatch 的模式反复出现

**文件**:

- `DefaultPropertyContent.tsx` — label、name、defaultValue、colSpan、componentProps（5 处）
- `RulesEditor.tsx` — message、pattern（2 处）
- `StaticExpressionToggle.tsx` — exprValue（1 处）

**建议**: 提取 `useDebouncedFieldUpdate(fieldId, patchKey, initialValue)` hook：

```ts
function useDebouncedFieldUpdate(
  dispatch: React.Dispatch<DesignerAction>,
  fieldId: string,
  key: string,
  initialValue: unknown,
) {
  return useDebouncedInput(initialValue, (v) => {
    dispatch({ type: 'UPDATE_FIELD', fieldId, patch: { [key]: v } })
  })
}
```

**当前状态**: 已完成。

- 新增 `useDebouncedFieldUpdate` Hook（`packages/core/src/designer/useDebouncedFieldUpdate.ts`），在 `useDebouncedInput` 之上封装"本地反馈 + 防抖 dispatch UPDATE_FIELD"模式，签名支持可选 `transform` / `skip` / `delay`。
- 5 处简单调用点已切换为新 Hook：
  - `FieldLabelEditor` — `label`，`transform: (v) => String(v) || undefined`。
  - `DefaultPropertyContent` — `defaultValue`，`transform: (v) => v || undefined`。
  - `AdvancedSection` — `colSpan`，`transform: (v) => Number(v)`。
  - `StaticExpressionToggle` — `disabled/readOnly/hidden` 表达式分支，`transform: (v) => (v as string) || false`。
  - `FieldNameEditor` — `name`，搭配 `skip: (v) => !newName || existingNames.has(newName)` 处理重复名校验。
- 保留原 `useDebouncedInput`：`RulesEditor`（嵌套 `rules` 对象 patch + `cancelPending`）与 `ComponentPropsSection`（`useDebouncedObjectMap`，键值对模式）暂不适合直接套用本 Hook。

---

## 三、职责过重的组件 → 拆分建议

### S1：`DesignerInner` (Designer.tsx L80-209)

**当前职责**（8 项）：

1. Reducer state 管理 + history
2. Scene state 管理
3. Field index 计算
4. Selected field 查找
5. DnD 集成（通过 useDndHandlers）
6. 三 Context Provider 构建
7. Canvas adapter 选择逻辑
8. 完整布局渲染（三栏 + DragOverlay）

**拆分建议**:

- 提取 `useDesignerState(schema, onChange)` — 管理 reducer + scene + sync + fieldIndex
- 提取 `useAdapterSelection(desktopAdapter, mobileAdapter, scene)` — adapter 选择逻辑
- 将布局渲染提取为 `DesignerLayout` 组件，仅接收 props

---

### S2：`DefaultPropertyContent` (264 行)

**当前职责**（6 项）：

1. 字段名编辑（含重复校验 + 防抖）
2. 字段标签编辑（含显示/隐藏切换）
3. 默认值编辑
4. ComponentProps 编辑（含自定义防抖逻辑）
5. 高级属性（colSpan、rules、disabled/readOnly/hidden 静态/表达式切换）
6. 事件编辑器入口

**拆分建议**:

- 提取 `<FieldNameEditor>` — 字段名 + 校验
- 提取 `<FieldLabelEditor>` — 标签 + 隐藏切换
- 提取 `<ComponentPropsSection>` — componentProps 防抖 + 渲染
- 提取 `<AdvancedSection>` — colSpan + rules + 三个 StaticExpressionToggle
  **当前状态**: 已完成拆分，`DefaultPropertyContent` 已被拆分为多个子模块。

---

### S3：`FormConfigPanel` (146 行)

**当前职责**:

1. Desktop 配置（布局、标签对齐、变体、列宽、背景色）
2. Mobile 配置（布局、背景色）
3. 全局配置（冒号、必填标记）

**当前状态**: 已完成拆分。

- 拆出 `FormConfigPanel/` 目录（取代原单文件 `FormConfigPanel.tsx`）。
- 子组件：`GlobalFormConfig` / `DesktopFormConfig` / `MobileFormConfig`。
- 公共常量与 patch 构造器集中在 `FormConfigPanel/types.ts`（`COL_SPAN_OPTIONS` / `buildColPatch` / `buildPageBgPatch`）。
- 导入侧：原 `./FormConfigPanel` 引用因路径自动解析为目录，无须调整 `PropertyPanel.tsx` 的 import。

---

### S4：`FieldRenderer` (331 行)

**当前职责**:

1. 表达式计算（disabled/required）
2. Options 解析（4 层优先级）
3. 事件处理器解析
4. handleChange 包装
5. fieldProps 组装
6. formItemProps 组装
7. 组件查找（3 层优先级）
8. JSX 类型特殊处理
9. 实际渲染

**拆分建议**:

- 提取 `useFieldOptions(field, options)` hook
- 提取 `useFieldProps(...)` hook — 组装 fieldProps
- 提取 `useFormItemProps(...)` hook — 组装 formItemProps

---

### S5：`useDndHandlers` (310 行)

**当前职责**:

1. DnD state 管理
2. Sensors 配置
3. Collision detection 算法
4. handleDragStart
5. handleDragOver（含多种目标类型判断）
6. handleDragEnd（含位置计算 + dispatch）
7. handleDragCancel

**拆分建议**:

- 提取 `useDragOverComputation(fields, fieldIndex)` — 将 computeDropTarget + handleDragOver 独立
- 提取 `useDragCommit(fields, fieldIndex, dispatch)` — handleDragEnd 的提交逻辑
- 保留 `useDndHandlers` 作为组合 hook

---

## 四、实施优先级

| 优先级 | 编号    | 改动                            | 预估影响                                |
| ------ | ------- | ------------------------------- | --------------------------------------- |
| **P0** | 性能-1  | fieldNames useMemo 化           | 消除 4 次数组创建，5 分钟改动（已完成） |
| **P0** | 性能-6  | FormConfigPanel 常量提取        | 消除 GC 压力，5 分钟改动（已完成）      |
| **P1** | 重复-H2 | childrenByColumn hook           | 消除重复代码，15 分钟（已完成）         |
| **P1** | 重复-H3 | Collapse/Tabs 合并              | 消除重复组件，20 分钟（已完成）         |
| **P1** | 重复-H4 | useSlot hook                    | 消除 3 处重复，10 分钟（已完成）        |
| **P1** | 重复-H1 | useContainerDroppable hook      | 消除 3 处重复，20 分钟（已完成）        |
| **P2** | 性能-4  | treeData 延迟计算               | 简单优化，10 分钟（已完成）             |
| **P2** | 性能-5  | componentProps 防抖重构         | 复用 useDebouncedInput，30 分钟（已完成） |
| **P2** | 拆分-S2 | DefaultPropertyContent 拆分     | 可维护性提升，1 小时（已完成）          |
| **P2** | 拆分-S3 | FormConfigPanel 拆分            | 可读性 + 单测友好，30 分钟（已完成）    |
| **P2** | 拆分-S4 | FieldRenderer hooks 提取        | 组件 331→250 行，30 分钟（已完成）      |
| **P2** | 性能-1  | DesignerInner content memo 化   | 提取常量 + DragGhost + useMemo，30 分钟（已完成） |
| **P3** | 重复-H5 | useDebouncedFieldUpdate hook    | 消除 5 处重复，30 分钟（已完成）      |
| **P4** | 性能-2  | History 改用 structural sharing | 重大架构变更，4+ 小时                   |
| **P4** | 拆分-S1 | DesignerInner 拆分              | 架构重构，2-3 小时                      |
| **P4** | 拆分-S5 | useDndHandlers 拆分             | 重构，1 小时                            |

---

## 五、风险与注意事项

1. **Theme Token 约束**: 所有样式改动必须保持走 Token，不能引入硬编码颜色/间距
2. **向后兼容**: `useDesignerContext` 已标记 deprecated，拆分时不要破坏旧 API
3. **React 19 兼容**: 注意 ref 作为 prop 的新模式，避免使用已废弃的 forwardRef
4. **测试覆盖**: 每次重构后确保 `pnpm test` 全通过
5. **实测验证**: 先用 React Profiler 或 render count 复核性能热点，避免优化已完成或收益有限的代码路径。
