# 拖拽后续 Bug 修复计划

## 状态：✅ 已合并到新计划

## Bug 列表

1. 容器内 Grid 组件没有按列数横排
2. 预览时列数不正确（2 列各占 1/12 而非 1/2）
3. 容器内组件无法碰撞拖拽排序
4. 往容器外拖拽时无法达到预期位置（容器边缘问题）
5. 拖拽容器松手时容器消失

---

## Bug 1 & 2 分析：Grid 布局问题

### 根因

Grid 的 `columns` 属性语义不一致：

- **palette 默认值**：`componentProps: { columns: 2, gap: 16 }` — 这里的 `columns: 2` 表示"2 列"
- **Grid 组件实现**：`columns` 默认值 `24`，用作 antd `Col` 的 `span` 总数（24 栅格系统）
- **Grid 组件计算**：`span = Math.floor(columns / childrenArray.length)` — 当 `columns=2` 时，`span=1`（2/2=1），而 antd 总栅格是 24，所以每个子组件只占 1/24 ≈ 4%

**设计器中的问题**：ContainerPreview 直接用 SortableContext + NestedField 渲染子组件，NestedField 包裹 FieldItem（带 padding/border），Grid 的 Row/Col 布局被 FieldItem 的 block 布局打断。

### 修复方案

#### Fix 1: Grid 组件区分 columns（列数）和 span 总数

**文件**: `packages/adapter-antd/src/components/Grid.tsx`

- Grid 组件的 `columns` 属性语义改为"列数"（2=两列，3=三列），不再混用 24 栅格
- 内部计算：`span = Math.floor(24 / columns)` — `columns=2` → `span=12`，每个子组件占 50%
- 有 `cols` 配置时，`cols[i].span` 仍使用 24 栅格系统

#### Fix 2: ContainerPreview 对 Grid 使用 Grid 预览组件

**文件**: `packages/core/src/designer/ContainerPreview.tsx`

- 当前所有容器统一用 ContainerPreview 渲染（竖向排列 + SortableContext）
- Grid 需要横向排列子组件
- 方案：ContainerPreview 根据 field.type 区分渲染方式
  - `grid` → GridPreview（横向 Row/Col 布局 + SortableContext）
  - `flex` → FlexPreview（横向 flex 布局 + SortableContext）
  - 其他 → 现有竖向布局

#### Fix 3: 预览时 FormRender 的 colSpan 处理

**文件**: `packages/core/src/renderer/FormRender.tsx`

- FormRender 在渲染字段时包裹了 `<div style={{ width: \`\${(field.colSpan || 24) / 24 * 100}%\` }}>` — 这会限制 Grid 容器的宽度
- Grid 作为容器应该占满全宽，不应受 colSpan 限制
- 方案：容器组件的 colSpan 默认为 24（全宽）

---

## Bug 3 分析：容器内组件无法碰撞拖拽排序

### 根因

碰撞检测（collisionDetection）只遍历根级容器（`state.schema.fields`），不处理嵌套容器内的子组件排序。

当拖拽容器内的子组件时，碰撞检测的边缘区域逻辑检查的是根级容器的 rect，而不是嵌套 SortableContext 内部的碰撞。对于同容器内的排序，dnd-kit 的 `SortableContext` + `verticalListSortingStrategy` 应该自动处理碰撞检测，但当前自定义的 `collisionDetection` 覆盖了默认行为，导致嵌套 SortableContext 的碰撞检测失效。

### 修复方案

#### Fix 4: 碰撞检测对同容器排序使用默认策略

**文件**: `packages/core/src/designer/Designer.tsx`

- 当前自定义碰撞检测对所有拖拽都应用边缘区域逻辑
- 对于容器内子组件之间的排序，应该让 SortableContext 的默认碰撞检测生效
- 方案：当 active 和 over 都在同一个容器内时，跳过自定义碰撞检测，使用 `pointerWithin` 或 `closestCorners` 的默认行为

---

## Bug 4 分析：往容器外拖拽时无法达到预期位置

### 根因

碰撞检测的边缘区域逻辑只检查根级容器。当从容器内拖出组件到根级时：

1. 如果最后一个根级组件是容器，拖到容器下方时碰撞检测返回 `field.id!`（容器自身），resolveDropTarget 返回 `{ index: containerIndex + 1 }`，这是正确的
2. 但如果拖拽指针在容器的边缘区域内（top/bottom 20%），碰撞检测会将目标重定向到容器内部，导致无法拖出

此外，`CANVAS_ROOT_HEAD_ID` 没有对应的 droppable 元素，当画布第一个组件是容器时，拖到最上方无法触发 `CANVAS_ROOT_HEAD_ID` 的碰撞。

### 修复方案

#### Fix 5: 碰撞检测支持从容器内拖出

**文件**: `packages/core/src/designer/Designer.tsx`

- 当拖拽源在容器内（`sourcePos.parentId` 存在）时，边缘区域逻辑不应阻止拖出
- 方案：边缘区域逻辑只在拖拽源来自根级时才生效，容器内拖出的组件应能自由放置到根级

#### Fix 6: 添加 CANVAS_ROOT_HEAD 的 droppable 区域

**文件**: `packages/core/src/designer/Canvas.tsx`

- 当前 `CANVAS_ROOT_HEAD_ID` 没有对应的 droppable 元素
- 在画布顶部添加一个不可见的 droppable 区域，使得拖到最上方时能正确触发

---

## Bug 5 分析：拖拽容器松手时容器消失

### 根因

当拖拽容器自身时，`handleDragOver` 可能将容器移入自身（`sourcePos.parentId` 为 undefined，`targetParentId` 为容器自身的 id），导致容器变成自己的子组件，从根级消失。

虽然 `handleDragOver` 有 `sourcePos.parentId === containerId` 的检查，但容器拖拽到自身的 `__container` droppable 时，`sourcePos.parentId` 是 undefined（根级），`containerId` 是容器 id，检查通过，导致容器被移入自身。

### 修复方案

#### Fix 7: 防止容器拖入自身

**文件**: `packages/core/src/designer/Designer.tsx`

- 在 `handleDragOver` 和 `handleDragEnd` 中，检查拖拽目标是否是拖拽源自身或其后代
- 如果 `activeId === containerId`（容器拖入自身的 `__container`），跳过
- 如果 `activeId` 是目标容器的祖先，跳过（防止循环嵌套）

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `packages/adapter-antd/src/components/Grid.tsx` | columns 语义改为列数，span 计算用 24/columns |
| `packages/core/src/designer/ContainerPreview.tsx` | Grid/Flex 容器使用横向布局预览 |
| `packages/core/src/designer/Designer.tsx` | 碰撞检测修复（容器内排序、拖出、防自嵌套） |
| `packages/core/src/designer/Canvas.tsx` | 添加 CANVAS_ROOT_HEAD droppable |
| `packages/core/src/renderer/FormRender.tsx` | 容器组件 colSpan 默认 24 |

---

## 实施顺序

1. Fix 7 — 防止容器拖入自身（最紧急，数据损坏风险）
2. Fix 1 — Grid columns 语义修正
3. Fix 2 — ContainerPreview Grid 横向布局
4. Fix 3 — FormRender 容器 colSpan
5. Fix 4 — 碰撞检测容器内排序
6. Fix 5 — 碰撞检测从容器内拖出
7. Fix 6 — CANVAS_ROOT_HEAD droppable
8. 验证 — 编译 + 手动测试
