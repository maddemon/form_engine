# Grid 列分隔符 & Table 组件设计计划

## 状态：✅ 已完成

## 两部分需求

1. **Grid 增强**：列之间加分隔符，每列为独立可拖放区，分隔符可拖动调整列宽
2. **Table 新组件**：桌面端为表格（可拖拽列宽），移动端为 Card 竖排，每列可拖入不同组件

---

## 关于「droppable」的说明（回应你第 3 个问题）

droppable（可放置区）是 dnd-kit 的概念。`useDroppable` 创建一个"接收拖拽"的区域。当前代码中用 `useDroppable({ id: "${field.id}__container" })` 创建容器的可放置区。

对于 Grid 和 Table，每个列都需要自己的 droppable zone（ID 格式 `${field.id}__col_0`、`${field.id}__col_1` 等），这样拖拽组件时才知道要放到哪一列。

### 关于是否共用

**选项 B（统一抽象）可行，推荐**。因为 Grid 和 Table 的列级行为完全一致——每列都是：
1. 一个 `useDroppable` 区域
2. 内部一个 `SortableContext`（容器内子组件排序）
3. 后面的分隔符 + 拖拽调整宽度

差异仅在于**外部布局方式**（Grid 用 flex 横向排列，Table 用 `<table>` 结构）。所以共享一个 `ColumnDropZone` 组件是干净的抽象，不会带来额外复杂度。

---

## 第一部分：Grid 列分隔符与独立可拖放区

### 当前问题

- Grid 的子组件是扁平数组，均匀分布到各列，没有"每个列独立拖放"的概念
- ContainerPreview 中 Grid 用 CSS grid `repeat(N, 1fr)` 渲染，列宽固定，无法调整
- 没有列分隔符

### 方案：Column-Index 模型

Grid 保持 children 为扁平数组，每个 child 新增 `columnIndex` 字段标记所属列：

```typescript
// FormFieldSchema 新增字段（持久化到 schema，选项 B 选定）
export interface FormFieldSchema {
  columnIndex?: number  // 标记所属列。拖出 Grid/Table 时需清除此字段
}
```

Grid 的 `componentProps` 新增 `colWidths`：

```typescript
export interface GridProps extends BaseLayoutComponentProps {
  columns?: number
  colWidths?: number[]      // 各列宽度百分比，如 [40, 60]，默认均分
  gap?: number
  variant?: 'grid' | 'flex'
}
```

### 架构：ColumnDropZone 共享组件

新增可复用组件 `ColumnDropZone`，Grid 和 Table 共用：

```
ColumnDropZone (props: { parentId, columnIndex, children, colWidth, onResize })
  ├── useDroppable({ id: `${parentId}__col_${columnIndex}` })
  ├── SortableContext (列内子组件排序)
  │   └── children.map(child => <NestedField ... />)
  │
  ├── [空状态提示 - 当 children 为空时]
  └── ColumnResizeHandle (列分隔符 + 拖拽调整)
```

Grid 预览使用：

```
ContainerPreview (Grid)
  └── flex row
      ├── ColumnDropZone (columnIndex=0)
      ├── ColumnDropZone (columnIndex=1)
      └── ColumnDropZone (columnIndex=2)
```

Table 预览使用：

```
ContainerPreview (Table)
  └── <table>
        ├── <thead>
        │     <tr>
        │       <th>姓名</th> <ColumnResizeHandle />
        │       <th>年龄</th> <ColumnResizeHandle />
        │       <th>操作</th>
        │     </tr>
        ├── <tbody>
        │     <tr>  ← 仅设计器渲染一行"模板"
        │       <td><ColumnDropZone (columnIndex=0) /></td>
        │       <td><ColumnDropZone (columnIndex=1) /></td>
        │       <td><ColumnDropZone (columnIndex=2) /></td>
        │     </tr>
        └── 行操作控制区 (添加行 / 固定行数)
```

### 列宽拖动实现

```typescript
// ColumnResizeHandle 组件
// 通过 onMouseDown + document mousemove/mouseup 实现
// 不依赖 dnd-kit，纯原生拖拽更轻量

// 接收回调:
// onResize: (deltaWidth: number) => void
// deltaWidth > 0: 左侧列变宽，右侧列变窄
// deltaWidth < 0: 左侧列变窄，右侧列变宽
// 最小宽度限制：每列不少于设定 minWidth 或 10%
```

### 跨列拖拽

当从某列拖出组件放到另一列时，`handleDragOver` 或 `handleDragEnd` 中检测：
1. `findFieldPosition` 拿到 `sourcePos`
2. 从 `over.id` 解析 `_col_` 后缀得到目标 `columnIndex` 和 `parentId`
3. Dispatch `MOVE_FIELD` 并更新 `columnIndex`

### 修改文件清单

| 文件 | 修改 |
|------|------|
| `types/schema.ts` | FormFieldSchema 新增可选 `columnIndex?: number` |
| `components/grid/types.ts` | GridProps 新增 `colWidths?: number[]` |
| `components/grid/Props.tsx` | 属性面板新增 colWidths 编辑 |
| `designer/ColumnDropZone.tsx` | **新增** - ColumnResizeHandle + useDroppable + 子 SortableContext |
| `designer/ContainerPreview.tsx` | Grid 分支使用 ColumnDropZone + flex 布局 |
| `designer/Designer.tsx` | handleDragOver/End 支持跨列判断 |
| `adapter-antd/Grid.tsx` | 支持 colWidths 渲染列宽 |
| `adapter-antd-mobile/Grid.tsx` | 支持 colWidths 渲染列宽 |

---

## 第二部分：Table 新组件

### Schema 设计

```typescript
type FieldType = 'table'  // 新增

export interface TableProps extends BaseLayoutComponentProps {
  // 列配置
  columns: TableColumnConfig[]
  // 行模式
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number  // fixed 时的固定行数
}

export interface TableColumnConfig {
  label: string          // 列标题
  width: number          // 宽度百分比
  minWidth?: number      // 最小宽度百分比
}
```

**数据示例**：

```typescript
{
  type: 'table',
  id: 'table-1',
  name: 'users',  // ← form 的表单字段名，值将存储为数组
  componentProps: {
    columns: [
      { label: '姓名', width: 40, minWidth: 20 },
      { label: '年龄', width: 30, minWidth: 15 },
      { label: '操作', width: 30, minWidth: 15 },
    ],
    rowMode: 'dynamic',
  },
  children: [
    // 每个 child 对应一列的内容模板
    { id: 'tpl-0', type: 'input', columnIndex: 0, name: 'name' },
    { id: 'tpl-1', type: 'input-number', columnIndex: 1, name: 'age' },
    { id: 'tpl-2', type: 'button', columnIndex: 2, name: 'action' },
  ]
}
```

### Form 数据格式（选项 B 选定）

Table 在 form 中的值是一个数组，每行一个对象：

```typescript
formValues: {
  users: [
    { name: '张三', age: 25, action: 'edit' },
    { name: '李四', age: 30, action: 'delete' },
  ]
}
```

**Table 运行时渲染要点**：

```
Table adapter 收到 {
  value: [ { name: '张三', age: 25 }, { name: '李四', age: 30 } ],
  onChange: (newVal) => formValues.users = newVal,
  fieldSchema: { children: [/* column templates */] }
}
```

- `value` = 行数据数组
- `onChange` = 更新整个数组
- `fieldSchema.children` = 各列内容模板
- 每行每个单元格的数据 = `row[columnName]`
- 每行每个单元格的渲染 = `FieldRenderer(template_field, { value: row[template_field.name], onChange: (v) => updateRow(rowIndex, template_field.name, v) })`

### 行数据管理（在 adapter Table 组件内实现）

```typescript
// 新增行
const addRow = () => {
  const newRow = columns.reduce((acc, col, i) => {
    const child = fieldSchema.children.find(c => c.columnIndex === i)
    acc[child?.name || `col_${i}`] = undefined
    return acc
  }, {} as Record<string, unknown>)
  onChange([...value, newRow])
}

// 删除行
const removeRow = (rowIndex: number) => {
  onChange(value.filter((_, i) => i !== rowIndex))
}

// 更新单元格
const updateCell = (rowIndex: number, fieldName: string, cellValue: unknown) => {
  const newVal = value.map((row, i) =>
    i === rowIndex ? { ...row, [fieldName]: cellValue } : row,
  )
  onChange(newVal)
}
```

### Palette 配置

```typescript
export const palette: ComponentPalette = {
  label: '表格',
  category: 'container',
  icon: <TableIcon />,
  defaultProps: {
    componentProps: {
      columns: [
        { label: '列1', width: 50, minWidth: 20 },
        { label: '列2', width: 50, minWidth: 20 },
      ],
      rowMode: 'dynamic',
    },
  },
}
```

### 修改/新增文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `types/schema.ts` | 修改 | `FieldType` 新增 `'table'` |
| `components/table/types.ts` | 新增 | `TableProps`、`TableColumnConfig` |
| `components/table/palette.tsx` | 新增 | Palette 注册 |
| `components/table/Props.tsx` | 新增 | 属性面板 |
| `types/component-props.ts` | 修改 | 导出 `TableProps` |
| `types/component-category.ts` | 修改 | 注册 `'table'` 为 container |
| `components/icons/index.tsx` | 修改 | 新增 `TableIcon` |
| `designer/ContainerPreview.tsx` | 修改 | 处理 `'table'` 类型，使用 ColumnDropZone |
| `adapter-antd/src/components/Table.tsx` | 新增 | 桌面端 table 渲染 + 行数据管理 |
| `adapter-antd/src/index.tsx` | 修改 | 注册 table 组件 |
| `adapter-antd-mobile/src/components/Table.tsx` | 新增 | 移动端 card 渲染 + 行数据管理 |
| `adapter-antd-mobile/src/index.tsx` | 修改 | 注册 table 组件 |
| `components/table/index.ts` | 新增 | 组件入口 |

---

## 实施顺序

### Step 1: 基础设施
1. `FormFieldSchema` 新增 `columnIndex` 字段
2. 新建 `ColumnDropZone` + `ColumnResizeHandle` 组件
3. `GridProps` 新增 `colWidths` 字段

### Step 2: Grid 增强
4. `ContainerPreview` 中 Grid 分支使用 `ColumnDropZone` + flex 布局
5. `Designer.tsx` 支持跨列拖拽判断
6. `adapter-antd/Grid.tsx` 支持 colWidths

### Step 3: Table 组件——类型与设计器
7. Table 类型定义（types.ts、schema.ts、component-category.ts）
8. Palette + Props 面板
9. ContainerPreview 中 Table 分支渲染（表头 + ColumnDropZone）

### Step 4: Table 组件——运行时渲染（adapter）
10. `adapter-antd/Table.tsx` — 桌面端 `<table>` + 行数据管理
11. `adapter-antd-mobile/Table.tsx` — 移动端 Card 竖排 + 行数据管理
12. adapter 注册

### Step 5: 收尾
13. 编译验证 + 所有拖拽场景测试