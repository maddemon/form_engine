# DnD Kit 迁移计划

## 现状

当前使用 HTML5 原生 DnD API，已暴露出以下问题：

| 问题 | 描述 | 影响 |
|------|------|------|
| 触屏不支持 | 原生 DnD 触屏无效 | 移动端不可用 |
| 无动画 | 拖拽时无幽灵图、占位符、排序过渡 | 体验僵硬 |
| 容器内排序受限 | 所有容器内放置 `toIndex` 硬编码为 `0` | 用户无法控制顺序 |
| 命令式样式 | `ContainerPreview` 在 `onDragOver` 中直接改 `style.borderColor` | 反 React 模式 |
| 数据传递脆弱 | 通过 `dataTransfer.setData` 传递 JSON 字符串 | 无编译期检查 |
| 无无障碍支持 | 不支持键盘操作 | 无障碍不达标 |

## 目标

用 `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` 替代原生 DnD，实现：

1. 调色板→画布（根级与容器内）拖放创建字段
2. 根级字段排序
3. 容器内子字段排序（同容器及跨容器）
4. 容器→根级移出
5. 拖拽时幽灵图（DragOverlay）+ 占位符 + 排序动画
6. 触屏支持
7. 可访问的基础键盘支持

## 非目标

- 不改造 reducer（`MOVE_FIELD` / `ADD_FIELD` 动作格式保持不变）
- `DesignerAction` 类型不变（`fromIndex`/`toIndex`/`fromParentId`/`toParentId` 继续使用）
- 不改变 `DesignerContext` 结构
- 不重构 `FieldItem` 的选中/工具栏逻辑 — 只替换拖拽部分

---

## 执行步骤

### Step 1 — 安装依赖

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Step 2 — 类型层改造 (`types/designer-drag.ts`)

**删除**（不再需要）:
- `serializeDragData` / `deserializeDragData`
- `readDragData` / `writeDragData`
- `DRAG_FORMAT` 常量

**保留**:
- `PaletteDragData` — dndkit 中通过 `useDraggable({ data: { ... } })` 传递
- `CanvasDragData` — 同上
- `isPaletteDrag` / `isCanvasDrag` — 类型守卫仍可用于 `onDragEnd` 中分发
- `toPaletteItem` — 创建字段时仍需使用

**数据传递方式变化**:
```
之前: writeDragData(event, data) → dataTransfer.setData('designer-drag', JSON.stringify(data))
之后: useDraggable({ id, data: myData }) → onDragEnd 中 event.active.data.current
```

### Step 3 — Canvas.tsx 改造

**变更**:
1. 移除 `handleDragOver`, `handleDrop`, `handleDragStart` 三个函数
2. 移除所有原生事件绑定（`onDragOver`, `onDrop`）
3. 用 `<DndContext>` + `<SortableContext>` 包裹画布内容
4. 统一 `handleDragEnd`（替换 `handleDrop` + `handleDropOnContainer`）

**新增**:
- `handleDragEnd(event)` — 读取 `event.active.data.current` 和 `event.over`，根据 `source` 分发 `ADD_FIELD` 或 `MOVE_FIELD`
- `<DragOverlay>` 渲染拖拽中的幽灵元素

**签名变化**:
```
之前: (props) → Canvas({ schema, fields, adapter, scene, dispatch, selectedFieldId, onSelectField })
之后: Canvas → 所有数据从 DesignerContext 获取，外加 <DndContext> 包裹
```

### Step 4 — RootFields.tsx 改造

**变更**:
1. 移除 `onDragStart`, `onDrop` props — 这些通过 `SortableContext` + `useSortable` 隐式处理
2. 用 `<SortableContext items={fieldIds}>` + `verticalListSortingStrategy` 包裹

**新增**:
- `handleSortEnd(event)` — 但此场景已由画布的 `handleDragEnd` 统一接管

**不再需要**:
- 包装 `onDragStart={(e) => onDragStart(e, index, field)}`
- 包装 `onDrop={(e) => onDrop(e, index)}`
- FieldItem 的 `withDragHandlers` prop

### Step 5 — NestedField.tsx 改造

**变更**:
1. 移除 `hasDragHandlers` 条件逻辑
2. 移除手写的 `onDragStart` / `onDrop` handler
3. 改为使用 `useSortable` 或 `useDraggable`（取决于是否想要排序功能 + 手柄约束）
4. 每个容器内的字段列表由 `<SortableContext>` 包裹

**核心变化**:
- 当前：`draggable` 在 `FieldItem` 的工具栏中，`onDrop` 硬编码 `toIndex: 0`
- 目标：`useSortable` 提供拖拽 + 放置位置，`onDragEnd` 中的 `over.id` 计算真实 `toIndex`

### Step 6 — ContainerPreview.tsx 改造

**变更**:
1. 移除 `handleDropOnContainer` 函数
2. 移除内联 `onDragOver`/`onDragLeave`/`onDrop` 事件
3. 移除命令式 `style.borderColor` 修改
4. 用 `useDroppable` + `<SortableContext>` 替换

**新增**:
- `<SortableContext items={childIds}>` 包含容器的子节点
- 拖拽悬停时的 CSS 类切换（基于 `useDroppable` 的 `isOver`）

### Step 7 — FieldItem.tsx 改造

**变更**:
1. 移除 `withDragHandlers`, `onDragStart`, `onDrop` props
2. 移除 `<div onDragOver>`, `<div onDrop>` 事件绑定
3. 工具栏中的拖拽手柄改为使用 `useSortable` 的 `listeners` + `setActivatorNodeRef`

**新增**:
- 从 `useSortable` 获取 `{ attributes, listeners, setNodeRef, transform, transition, isDragging }`
- 当 `isDragging` 时应用透明度/变换样式

### Step 8 — Designer.tsx 改造

**变更**:
1. 移除 `handlePaletteDragStart`（不再需要写 dataTransfer）
2. `FieldList` 不再需要传入 `onDragStart` prop

### Step 9 — FieldList.tsx 改造

**变更**:
1. 每个 PaletteItem 从 `<div draggable onDragStart>` 改为 `<Draggable id={uniqueId} data={{ source:'palette', fieldType, label, defaultProps }}>`
2. 移除 `onDragStart` prop（不再需要传出去给 Canvas 注册）

### Step 10 — 测试与清理

1. 删除所有已移除函数的导入
2. 验证所有 6 个拖拽场景
3. 验证触屏拖拽
4. 验证 `pnpm run build`
5. 清理 `types/designer-drag.ts` 中不再使用的导出

---

## 6 个拖拽场景映射

| 场景 | 当前实现 | dndkit 实现 |
|------|---------|-------------|
| A: 调色板→根级 | `FieldList.onDragStart` → `Canvas.handleDrop` | `useDraggable` in FieldList → `DndContext.onDragEnd`检查 `over.id === 'canvas-root'` |
| B: 调色板→容器 | `FieldList.onDragStart` → `ContainerPreview.handleDropOnContainer` | `useDraggable` in FieldList → `DndContext.onDragEnd`检查 `over.id` 是否匹配容器 ID |
| C: 根级→根级排序 | `Canvas.handleDragStart` → `RootFields.onDrop` | `SortableContext`(根级) + `useSortable` 每个 FieldItem |
| D: 根级→容器 | `Canvas.handleDragStart` → `ContainerPreview.handleDropOnContainer` | `useDraggable`/`useSortable` → `DndContext.onDragEnd` 中 `over.id` 匹配容器 |
| E: 容器→根级 | `NestedField.onDragStart` → `Canvas.handleDrop` | `useSortable` 容器内 → `DndContext.onDragEnd` 中 `over.id === 'canvas-root'` |
| F: 容器↔容器 | `NestedField.onDragStart` → `ContainerPreview.handleDropOnContainer` / `NestedField.onDrop` | `SortableContext`(容器A) → `SortableContext`(容器B) 自动处理跨容器排序 |
| G: 容器内排序 | `NestedField.onDrop` 固定 `toIndex: 0` | `SortableContext`(容器) + `useSortable` 实现真实排序 |

---

## 风险与注意事项

1. **跨容器排序与 dndkit 策略** — `SortableContext` 默认不支持跨容器拖放。需要自定义策略或使用 `onDragEnd` 手动处理。方案：对每个容器使用独立的 `SortableContext`，在 `onDragEnd` 中通过 `active.containerId` 和 `over.containerId` 判断是否跨容器，手动计算 targetIndex。

2. **容器自身不应作为 SortableItem** — 容器是一个可放置区域（`Droppable`），同时它的子节点是可排序的。两种角色必须分开处理。

3. **DragOverlay 的渲染** — 幽灵图需要在 `<DragOverlay>` 中渲染一个轻量副本。可能需要一个 `renderFieldPreview(field)` 函数。

4. **FieldItem 的手柄约束** — 只有图标手柄可以拖拽，而非整个 field body。`useSortable` 通过 `{ activator: { ... } }` 配置或 `useSortable` + `setActivatorNodeRef` 实现手柄约束。需要在 FieldItem 中将 `setActivatorNodeRef` 绑定到工具栏的 `<span>`。

5. **根级与容器的 Drop 区域冲突** — 当容器在根级时，拖拽一个字段在一个容器上方时，需要保证容器及其子节点作为放置目标优先，而不是根级。dndkit 的 `collisionDetection` 算法可以配置来优先匹配最内层的 droppable。

---

## 执行顺序

```
Step 1 (安装) → Step 2 (类型) → Step 3 (Canvas/DndContext) → Step 7 (FieldItem/useSortable) → Step 6 (ContainerPreview/Droppable) → Step 4 (RootFields/SortableContext) → Step 5 (NestedField) → Step 8-9 (Designer/FieldList) → Step 10 (测试清理)
```

原因：
- 必须先装依赖
- 类型层变化后所有 import 都需要更新
- Canvas 做 DndContext 容器后各组件才能用 useSortable/useDroppable
- FieldItem 最先改造，因为所有拖拽入口都在它
- RootFields/NestedField 最后收束

## 完成状态

| Step | 文件 | 状态 |
|------|------|------|
| 1 — 安装依赖 | `packages/core/package.json` | ✅ 完成（`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`） |
| 2 — 类型层改造 | `types/designer-drag.ts` | ✅ 完成（删除序列化函数，简化 `CanvasDragData`） |
| 3 — Canvas DndContext | `designer/Canvas.tsx` | ✅ 完成（DndContext + handleDragEnd + DragOverlay + 根 droppable） |
| 4 — RootFields | `designer/RootFields.tsx` | ✅ 完成（SortableContext + useSortable，移除 onDragStart/onDrop props） |
| 5 — NestedField | `designer/NestedField.tsx` | ✅ 完成（useSortable 替代手写 drop handler） |
| 6 — ContainerPreview | `designer/ContainerPreview.tsx` | ✅ 完成（useDroppable + SortableContext，移除命令式样式） |
| 7 — FieldItem | `designer/FieldItem.tsx` | ✅ 完成（dragListeners/dragActivatorRef 手柄约束） |
| 8 — Designer | `designer/Designer.tsx` | ✅ 完成（移除 handlePaletteDragStart） |
| 9 — FieldList | `designer/FieldList.tsx` | ✅ 完成（useDraggable 替代原生 draggable） |
| 10 — 测试清理 | — | ✅ 完成（14/14 Code Review 通过） |

**Code Review 结果**: ✅ 构建通过，14/14 检查项全部通过。已知未解决的问题：1) 调色板拖拽时无 DragOverlay（`activeId` 格式不匹配）；2) 向下移动时 `toIndex` 可能偏移 1（预存在的 reducer 问题，非本次回归）。

**实际执行顺序**: Step 1 → Step 2 → Step 3 → Step 7 → Step 6 → Step 4 → Step 5 → Step 8 → Step 9 → Step 10 ✅
