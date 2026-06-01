# 设计器重构计划

## 现状问题

| 问题 | 位置 | 影响 |
|------|------|------|
| Canvas.tsx 439 行，含 6 个 render 函数（非组件） | `designer/Canvas.tsx` | 无法 memo，闭包捕获过多，每次渲染全部重新创建 |
| props drilling 5 层：Canvas → renderRootFields → renderContainerPreview → renderContainerContent → renderNestedField → renderFieldItem | Canvas.tsx | 传参链长，新增参数需改所有中间函数 |
| 拖拽数据无类型，JSON.parse 后是 any | Canvas.tsx 多处 | 运行时错误靠 try/catch，无编译期检查 |
| MOVE_FIELD 4 种移动场景，cloneFields + 递归函数重复定义 | reducer.ts:109-166 | 逻辑重复，难以维护 |
| Designer.tsx 有自己的 findFieldById，reducer.ts 也有一份 | Designer.tsx:76, reducer.ts:20 | 重复代码 |
| inline style 散落，无统一管理 | Canvas.tsx | 修改样式需逐处定位 |
| useFormDesigner hook 与 Designer.tsx 功能重叠 | hooks.ts, Designer.tsx | 外部使用者可能混淆，内部未统一 |

---

## Phase 1 — 类型安全的拖拽数据

**目标**: 消除 `JSON.parse/stringify` + any 的风险

**新增文件**: `types/designer-drag.ts`

```ts
// Palette → Canvas（从控件库拖出）
export type PaletteDragData = {
  source: 'palette'
  fieldType: string
  label: string
  defaultProps: Record<string, unknown>
}

// Canvas → Canvas（从画布拖拽）
export type CanvasDragData = {
  source: 'canvas'
  index: number
  fieldId: string
  fromParentId?: string
}

export type DesignerDragData = PaletteDragData | CanvasDragData

// 序列化/反序列化工具
export function serializeDragData(data: DesignerDragData): string
export function deserializeDragData(raw: string): DesignerDragData | null
```

**修改范围**:
- `Designer.tsx` — `handlePaletteDragStart` 用 `serializeDragData`
- `Canvas.tsx` — 所有 `setData`/`getData` 调用
- 删除 `data as PaletteItem` 等强制类型断言

---

## Phase 2 — DesignerContext

**目标**: 消除 Canvas 内部 5 层 props drilling

**新增文件**: `designer/DesignerContext.ts`

```ts
interface DesignerContextValue {
  dispatch: React.Dispatch<DesignerAction>
  selectedFieldId: SelectedFieldId
  onSelectField: (id: string | null) => void
  scene: DeviceScene
  adapter?: FormEngineAdapter
}
```

**修改范围**:
- 创建 `DesignerContext` + `useDesignerContext()` hook
- `Designer.tsx` 用 `<DesignerContext.Provider>` 包裹 Canvas
- 从 `Canvas.tsx` 及所有内部 render 函数中移除 `{ dispatch, selectedFieldId, onSelectField, scene }` 参数
- `Canvas.tsx` 内改为 `const { dispatch, selectedFieldId, onSelectField, scene } = useDesignerContext()`

---

## Phase 3 — 组件提取

**目标**: 将 Canvas.tsx 中的 6 个 render 函数拆为真实 React 组件，可用 React.memo

### 3a — FieldItem

**新增文件**: `designer/FieldItem.tsx`

功能说明：
- 原本 `renderFieldItem` 的逻辑
- 渲染 field 外层 wrapper、选中边框、蓝色工具栏（拖拽/复制/删除）
- 使用 `useDesignerContext()` 获取 dispatch/selectedFieldId/onSelectField
- 使用 `React.memo`，仅 `field.id`/`isSelected` 变化时重渲染

```
<FieldItem field={field} isSelected={boolean} withDragHandlers={boolean}>
  {content}  {/* 子内容由外部传入 */}
</FieldItem>
```

### 3b — ContainerPreview

**新增文件**: `designer/ContainerPreview.tsx`

功能说明：
- 原本 `renderContainerPreview` 的逻辑
- 根据 field.type 决定布局（Grid: flex+wrap, Flex: row/column, 其他: column）
- 渲染虚线边框 + 子元素列表 + 空态提示
- 拖拽 hover 时高亮效果

```
<ContainerPreview field={field} parentId={field.id}>
  {children}
</ContainerPreview>
```

### 3c — ContainerContent

**新增文件**: `designer/ContainerContent.tsx`

功能说明：
- 原本 `renderContainerContent` 的逻辑
- 遍历 field.children，为每个 child 创建 NestedField
- 将 children 放入 Grid/Flex 布局容器

```
<ContainerContent field={field} />
```

### 3d — NestedField

**新增文件**: `designer/NestedField.tsx`

功能说明：
- 原本 `renderNestedField` 的逻辑
- 容器内字段的包裹层
- 创建嵌套字段的拖拽 handlers（包含 fromParentId + childIndex）
- 如果是容器类型的子字段，递归渲染 ContainerPreview

```
<NestedField field={field} parentContainerId={parentId} childIndex={index} />
```

### 3e — RootFields

**新增文件**: `designer/RootFields.tsx`

功能说明：
- 原本 `renderRootFields` 的逻辑
- 遍历根层级 fields，为每个 field 创建 FieldItem
- 容器类型内嵌 ContainerPreview，非容器类型内嵌 FieldRenderer
- 创建根层级的拖拽 handlers

```
<RootFields />
<!-- 从 Context 取 fields，无需 props -->
```

---

## Phase 4 — Reducer 清理

**目标**: 消除 MOVE_FIELD 中重复的 cloneFields + 递归函数

**新增文件**: 无（在 `reducer.ts` 内改造）

**操作**:

1. 提取通用工具函数到文件顶部或独立 `tree-utils.ts`:
   ```
   function removeFromTree(fields, parentId, index) → { fields, removed }
   function insertIntoTree(fields, parentId, index, field) → fields
   function removeById(fields, fieldId) → fields
   function findInTree(fields, fieldId) → field | undefined
   ```

2. MOVE_FIELD 的 4 种场景简化为:
   ```ts
   case MOVE_FIELD: {
     const { fields: afterRemove, removed } = removeFromTree(
       state.schema.fields,
       action.fromParentId, // undefined = root
       action.fromIndex,
     )
     if (!removed) return state
     const fields = insertIntoTree(
       afterRemove,
       action.toParentId, // undefined = root
       action.toIndex,
       removed,
     )
     return { ...state, schema: { ...state.schema, fields } }
   }
   ```

3. 删除 `Designer.tsx` 中的 `findFieldById`，改为从 `reducer.ts` 导出

---

## Phase 5 — 样式组织

**目标**: 集中管理常用样式常量，减少 inline style 散乱

**新增文件**: `designer/styles.ts`

```ts
export const fieldItemStyle = { position: 'relative', padding: 8, marginBottom: 8, borderRadius: 6 }
export const selectedBorder = '2px solid #1890ff'
export const containerBorder = '1px dashed #d9d9d9'
export const transparentBorder = '2px solid transparent'
export const toolbarStyle = { ... }
```

---

## 执行顺序

```
Phase 2 (Context)  →  Phase 3 (Components)  →  Phase 1 (DragData)  →  Phase 4 (Reducer)  →  Phase 5 (Styles)
```

原因：
- Context 必须先做，否则组件拆分后 props 更多
- 组件拆分后用类型安全的拖拽数据更安全
- Reducer 改造独立，可并行
- 样式最后统一

**实际执行顺序**: 因方案讨论时的依赖关系，实际按 Phase 2 → Phase 3 → Phase 1 → Phase 4 → Phase 5 执行 ✅

---

## 完成状态

| Phase | 文件 | 状态 |
|-------|------|------|
| 1 — 类型安全的拖拽数据 | `types/designer-drag.ts` | ✅ 完成 |
| 2 — DesignerContext | `designer/DesignerContext.ts` | ✅ 完成 |
| 3a — FieldItem 组件 | `designer/FieldItem.tsx` | ✅ 完成 |
| 3b — ContainerPreview 组件 | `designer/ContainerPreview.tsx` | ✅ 完成 |
| 3c — ContainerContent 组件 | `designer/ContainerContent.tsx` | ❌ 未提取（逻辑内联在 ContainerPreview 中） |
| 3d — NestedField 组件 | `designer/NestedField.tsx` | ✅ 完成 |
| 3e — RootFields 组件 | `designer/RootFields.tsx` | ✅ 完成 |
| 4 — Reducer 清理 | `designer/reducer.ts` | ✅ 完成（MOVE_FIELD 单 case 统一） |
| 5 — 样式组织 | `designer/styles.ts` | ✅ 完成 |

**Code Review 结果**: ✅ 构建通过，核心目标全部达成。已知未解决的问题：`useFormDesigner` hook 重复（计划外），`React.memo` 未应用，`ContainerContent` 未单独提取。

---

## ⚠️ 注意

- 每一步改动后必须 `pnpm run build` 确认无错误
- 确保所有拖拽场景（palette→canvas, canvas→canvas 根层级/容器内/容器间/容器→根）不受影响
- 保持对外导出接口不变（index.ts 的 exports）
