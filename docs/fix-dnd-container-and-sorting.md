# 拖拽 Bug 修复计划

## 状态：✅ 已完成

## Bug 概述

1. **组件无法拖入容器**：不论从工具栏还是画布内，拖拽组件都无法放入容器
2. **向上拖拽排序异常**：画布内拖拽排序，往上拖拽跨过 1 个组件无法排序，至少跨 2 个才可以

## 历史背景

Bug 1 是修复"无法拖入画布根级"问题后引入的回归。之前的 bug 是：画布有容器时，拖拽总是进入容器而非根级。为此在碰撞检测中加入了边缘区域（edge zone）逻辑，但 ContainerPreview 的 droppable ID 与碰撞检测期望的格式不匹配，导致容器内部 droppable 永远找不到，拖入容器的路径完全断开。

---

## Bug 1 分析：组件无法拖入容器

### 根因

#### 1a. ContainerPreview droppable ID 不匹配（核心原因）

- [ContainerPreview.tsx:14](packages/core/src/designer/ContainerPreview.tsx#L14) 使用 `container-${field.id}` 作为 droppable ID
- [Designer.tsx:41](packages/core/src/designer/Designer.tsx#L41) 的 `resolveDropTarget` 期望 `${field.id}__container` 格式
- [Designer.tsx:166-168](packages/core/src/designer/Designer.tsx#L166-L168) 的碰撞检测构造 `${field.id}__container` 来查找内部 droppable rect
- **结果**：`args.droppableRects.get(innerDropId)` 永远返回 undefined，碰撞检测跳过容器内部，总是回退到根级目标

#### 1b. 容器子组件未渲染

- [RootFields.tsx:40-43](packages/core/src/designer/RootFields.tsx#L40-L43) 中容器组件渲染为 `<ContainerPreview field={field} />`，但未传入 children
- [NestedField.tsx](packages/core/src/designer/NestedField.tsx) 已定义但从未被使用
- **结果**：容器内部始终为空，即使数据中存在 children 也无法显示

#### 1c. 容器内无 SortableContext

- 容器内部没有 `SortableContext` 包裹子字段
- dnd-kit 的 sortable 无法追踪容器内子字段的排序状态
- **结果**：即使修复了 ID 和渲染问题，容器内的拖拽排序也无法工作

### 修复方案

#### Step 1: 修复 ContainerPreview droppable ID

**文件**: `packages/core/src/designer/ContainerPreview.tsx`

- 将 `useDroppable` 的 id 从 `container-${field.id}` 改为 `${field.id}__container`
- 与 `resolveDropTarget` 和碰撞检测中的 `__container` 后缀约定对齐
- **不会导致旧 bug 复发**：碰撞检测的边缘区域逻辑（top/bottom 20%）仍然保护根级拖放，只有中间 60% 区域且指针在内部 droppable rect 内时才允许拖入容器

#### Step 2: 在 ContainerPreview 中渲染子组件 + SortableContext

**文件**: `packages/core/src/designer/ContainerPreview.tsx`

- 接收 `field` prop（已有），从中读取 `field.children`
- 用 `<SortableContext items={childIds} strategy={verticalListSortingStrategy}>` 包裹子字段列表
- 为每个 child 渲染 `<NestedField>` 组件，传入 `parentContainerId={field.id}` 和 `childIndex={index}`

#### Step 3: 确认 NestedField 组件可用

**文件**: `packages/core/src/designer/NestedField.tsx`

- 当前 NestedField 已使用 `useSortable`，传入 `parentContainerId` 和 `childIndex`
- 需确认 `disabled` 逻辑正确：当 `parentContainerId === undefined || childIndex === undefined` 时禁用排序
- 在 ContainerPreview 中调用时需正确传入这两个 prop

#### Step 4: 碰撞检测对 canvas 拖拽也应用边缘区域保护

**文件**: `packages/core/src/designer/Designer.tsx`

- 当前边缘区域逻辑仅在 `isPaletteDrag(activeData)` 时生效
- Canvas 拖拽使用 `pointerWithin` + `closestCorners`，没有边缘区域保护
- 修复 ID 后，canvas 拖拽的 `pointerWithin` 可能匹配到容器内部 droppable，导致旧 bug 复发
- **修复**：将边缘区域逻辑提取为独立函数，对 palette 和 canvas 拖拽统一应用
- 边缘区域逻辑的核心逻辑不变：top/bottom 20% → 根级，中间区域 → 检查内部 droppable

#### Step 5: 更新 handleDragOver 支持跨容器拖拽

**文件**: `packages/core/src/designer/Designer.tsx`

- 当前 `handleDragOver` 只处理根级别排序（且存在 Bug 2 的翻转问题）
- 修复 Bug 2 后（见下文），`handleDragOver` 不再做同容器排序
- 需要增加跨容器拖拽的实时更新逻辑（从根级拖入容器、从容器拖出到根级）
- 在 `onDragOver` 中检测 `over.id` 是否为容器内部 droppable（`__container` 后缀），若是则将字段移入容器

#### Step 6: 更新 handleDragEnd 支持容器内排序

**文件**: `packages/core/src/designer/Designer.tsx`

- 当前 `handleDragEnd` 的画布拖拽部分只处理根级别排序
- 需要增加容器内排序和跨容器移动的最终确认逻辑
- `findFieldPosition` 已支持查找嵌套字段，可直接复用

---

## Bug 2 分析：向上拖拽跨 1 个组件无法排序

### 根因

[Designer.tsx:231-258](packages/core/src/designer/Designer.tsx#L231-L258) 的 `handleDragOver` 在每次拖拽事件中调用 `arrayMove` 并 dispatch `REORDER_FIELDS`，导致 **翻转问题（flip-flop）**：

1. 拖拽 item（index=2）向上经过 item（index=1）
2. `handleDragOver` 触发：`arrayMove(fields, 2, 1)` → item 移到 index 1，原 index 1 的 item 移到 index 2
3. React 重新渲染后，SortableContext 更新，碰撞检测重新计算
4. 此时拖拽指针仍在原位，但 item 已在 index 1，碰撞检测可能将 over 指向 index 2 的 item
5. `handleDragOver` 再次触发：`arrayMove(fields, 1, 2)` → item 又移回 index 2
6. 无限循环，视觉上表现为无法移动

**向下拖拽正常**的原因：向下移动时，`arrayMove` 将 item 移到目标位置，其他 item 上移填补空位。由于拖拽指针继续向下，碰撞检测持续匹配更下方的 item，不会产生翻转。

**跨 2 个及以上正常**的原因：移动距离足够大时，翻转后碰撞检测仍然匹配到正确的方向，不会立即翻转回来。

### 修复方案

#### Step 7: 移除 handleDragOver 中的同容器排序逻辑

**文件**: `packages/core/src/designer/Designer.tsx`

- 删除 `handleDragOver` 中对根级别 `arrayMove` + `REORDER_FIELDS` 的 dispatch
- 让 `SortableContext` + `verticalListSortingStrategy` 通过 CSS transform 处理拖拽过程中的视觉排序
- `handleDragOver` 仅保留跨容器拖拽的实时更新逻辑（Step 5）
- 同容器内的排序完全由 `handleDragEnd` 处理

#### Step 8: 在 handleDragEnd 中处理根级排序

**文件**: `packages/core/src/designer/Designer.tsx`

- 在画布拖拽分支中，当 `active.id !== over.id` 且同容器时，使用 `arrayMove` 计算新顺序
- dispatch `REORDER_FIELDS` 完成最终排序
- 跨容器的情况继续使用 `MOVE_FIELD`

---

## 旧 Bug 防护分析

修复 ID 不匹配后，旧 bug（"拖到画布根级总是进容器"）**不会复发**，原因：

1. **边缘区域逻辑保留**：碰撞检测的 top/bottom 20% 边缘区域仍然将拖拽重定向到根级目标
2. **中间区域有条件匹配**：中间 60% 区域仅在指针明确在容器内部 droppable rect 内时才允许拖入容器
3. **Canvas 拖拽也受保护**（Step 4）：将边缘区域逻辑统一应用到所有拖拽类型，防止 canvas 拖拽绕过保护
4. **过滤逻辑保留**：碰撞检测中的 `rootOnly` 过滤仍然排除 `__container` 后缀的 droppable

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `packages/core/src/designer/ContainerPreview.tsx` | 修复 droppable ID；渲染子组件 + SortableContext |
| `packages/core/src/designer/Designer.tsx` | 统一碰撞检测边缘区域保护；重构 handleDragOver/handleDragEnd |
| `packages/core/src/designer/NestedField.tsx` | 可能微调（确认 props 传递正确） |

**不修改的文件**：
- `reducer.ts`：动作格式不变
- `FieldItem.tsx`：展示逻辑不变
- `RootFields.tsx`：根级渲染逻辑不变
- `Canvas.tsx`：画布容器不变
- `FieldList.tsx`：工具栏不变

---

## 实施顺序

1. **Step 1** — 修复 ContainerPreview droppable ID
2. **Step 2-3** — ContainerPreview 渲染子组件 + NestedField 集成
3. **Step 4** — 碰撞检测统一边缘区域保护（防止旧 bug 复发）
4. **Step 7** — 移除 handleDragOver 同容器排序（修复 Bug 2）
5. **Step 8** — handleDragEnd 处理根级排序
6. **Step 5-6** — handleDragOver/handleDragEnd 支持跨容器拖拽
7. **验证** — 编译通过 + 手动测试所有拖拽场景

---

## 验证场景

| # | 场景 | 预期 |
|---|------|------|
| A | 从工具栏拖拽组件到画布根级 | 正常添加 |
| B | 从工具栏拖拽组件到容器内 | 正常添加到容器 children |
| C | 画布内根级向下拖拽排序 | 正常排序 |
| D | 画布内根级向上拖拽排序（跨 1 个） | 正常排序（修复 Bug 2） |
| E | 画布内从根级拖入容器 | 字段移入容器 |
| F | 画布内从容器拖出到根级 | 字段移出容器 |
| G | 容器内子字段排序 | 正常排序 |
| H | 跨容器拖拽 | 字段从容器 A 移到容器 B |
| I | 拖拽到容器边缘（top/bottom 20%） | 拖到根级而非容器内（旧 bug 不复发） |
