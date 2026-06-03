# Grid / Table / Collapse / Tabs 区域管理重设计

## 状态：✅ 已完成

## 目标复述

**Grid**
- 拖到画布后，多列以**独立可视块**呈现（每列有自己的边框和 droppable 区）
- **移除** Canvas 内列宽拖拽手柄（解决"闪烁 bug"）
- 属性面板提供**列列表编辑器**：
  - 可新增 / 删除 / 编辑 / 调序
  - 每行填写 `span`（1-24，整数）
  - 总和实时校验 ≤ 24
  - 至少保留 1 列
- 不再有 "列数" 字段，由列表决定

**Table**
- 同样移除 Canvas 内列宽拖拽
- 列在画布以**独立可视块**呈现（每列 cell 有边框）
- 属性面板提供**列列表编辑器**（内联展开）：
  - 每行：列标题(label) + 像素宽度(width px)
  - 可新增 / 删除 / 调序
- 保留 `rowMode`（dynamic / fixed）
- 不使用弹窗
- ⚠️ **breaking change**：`columns[].width` 从百分比改为**像素值**

**Collapse（折叠面板）**
- 现状：palette 写死 2 个子项（`type: 'collapse'`），无 Key/Header 字段，**用户无法新增/删除面板**
- 改为：属性面板的**面板列表**：
  - 每行：key + header 文本 + disabled 开关
  - 可新增 / 删除 / 调序
  - **key 唯一性校验**（重复时阻断保存）
  - 画布每个面板是**独立可视块**（顶部 Header 标签 + 内部 droppable）
  - 所有面板在画布**同时展开**（便于编辑）

**Tabs（标签页）**
- 现状：与 Collapse 同问题，palette 写死 2 个 tab
- 改为：属性面板的**标签页列表**：
  - 每行：key + title 文本 + disabled 开关
  - 可新增 / 删除 / 调序
  - **key 唯一性校验**（重复时阻断保存）
  - 画布每个 tab pane 是**独立可视块**（顶部 Title 标签 + 内部 droppable）
  - 所有标签页在画布**同时展开**（便于编辑）

**公共**
- 抽出通用 `ItemListEditor<T>` 组件到 `propRenders` 模块，4 个组件**共用**
- 抽出通用 `RegionPreview` 组件到 `designer` 模块，替代现有 `ColumnDropZone`
- 引入 `genId()` 工具到 `packages/core/src/utils/id.ts`
- 引入 `regionKey?: string` Schema 字段（Collapse/Tabs 子项的归属标识）
- 严格遵守主题 Token 约束，**`ColumnDropZone` 的 `check-tokens-disable` 豁免随文件删除而解除**，`RegionPreview` 必须严格 token 化

---

## 当前实现要点（基于 Phase 1 探索）

| 模块 | 现状 | 关键文件 |
|------|------|----------|
| Grid 类型 | `columns?: number` + `colWidths?: number[]` + `rows?: GridRowConfig[]` + `cols?: GridColConfig[]` | [grid/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/grid/types.ts) |
| Grid 属性面板 | 只暴露 columns/gap/padding/margin | [grid/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/grid/Props.tsx) |
| Grid 画布 | `ContainerPreview` 用 `ColumnDropZone` + `useColumnResize` | [ContainerPreview.tsx#L75-L160](file:///d:/Repos/form_engine/packages/core/src/designer/ContainerPreview.tsx#L75-L160) |
| 拖拽调宽闪烁 | `useColumnResize` 的 `mousemove` 每次像素移动都 dispatch → 闪 | [ColumnDropZone.tsx#L111-L179](file:///d:/Repos/form_engine/packages/core/src/designer/ColumnDropZone.tsx#L111-L179) |
| Table 类型 | `columns[].width: number`（**百分比**）+ `minWidth`（百分比） | [table/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/table/types.ts) |
| Table 属性面板 | **空实现** | [table/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/table/Props.tsx) |
| Collapse 类型 | 仅有 activeKey/accordion/ghost，**无 panels 字段** | [collapse/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/collapse/types.ts) |
| Collapse palette | 写死 `children: [{ type: 'collapse' }]` —— 用子"collapse 容器"模拟面板 | [collapse/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/collapse/palette.tsx) |
| Tabs 类型 | 仅有 activeKey/type/size，**无 tabs 字段** | [tabs/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/tabs/types.ts) |
| Tabs palette | 写死 `children: [{ type: 'tabs' }]` | [tabs/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/tabs/palette.tsx) |
| antd Collapse 适配器 | 文件内重复定义 `TabsProps`（**L88-L100**）和 `CollapsePanelProps` | [adapter-antd/Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Collapse.tsx) |
| antd Tabs 适配器 | 文件内重复定义 `TabsProps`（**L88-L101**）和 `TabPaneProps` | [adapter-antd/Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Tabs.tsx) |
| antd-mobile Grid | 用 `display:flex` 算百分比宽度，**无 antd Row/Col** | [adapter-antd-mobile/Grid.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Grid.tsx) |
| antd-mobile Collapse | 直接用 antd-mobile `<Collapse>` 包 children，无 Panel 抽象 | [adapter-antd-mobile/Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Collapse.tsx) |
| antd-mobile Tabs | 同上 | [adapter-antd-mobile/Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Tabs.tsx) |
| antd-mobile Table | 用 `<Card>` 列表（每行一个 Card）替代 `<table>` | [adapter-antd-mobile/Table.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Table.tsx) |
| Designer.tsx dnd | `__col_${n}` 出现 4 处：resolveDropTarget / handleDragOver / handleDragEnd / isValidCanvasTarget | [Designer.tsx#L45 / #L276 / #L334 / #L347](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx) |
| reducer.ts | `ADD_FIELD` 和 `MOVE_FIELD` 都有 `columnIndex` 字段处理逻辑 | [reducer.ts#L135-L137 / #L179-L181](file:///d:/Repos/form_engine/packages/core/src/designer/reducer.ts) |
| DesignerAction 类型 | `ADD_FIELD` 和 `MOVE_FIELD` 都有 `columnIndex?: number` | [designer.ts#L134 / #L136](file:///d:/Repos/form_engine/packages/core/src/types/designer.ts) |
| ColumnDropZone token | 文件首行 `/* check-tokens-disable */` —— 删除此文件后豁免解除 | [ColumnDropZone.tsx#L1](file:///d:/Repos/form_engine/packages/core/src/designer/ColumnDropZone.tsx) |
| 通用模式 | `propRenders/shared.tsx` 已有 `OptionRender`（参考实现） | [shared.tsx](file:///d:/Repos/form_engine/packages/core/src/propRenders/shared.tsx) |

---

## 架构设计

### 1. 数据模型

#### 1.1 新增 Schema 字段：`regionKey`
```ts
// packages/core/src/types/schema.ts
export interface FormFieldSchema {
  // ... existing
  /** 所属区域 key（仅在 region 容器内有效：collapse/tabs）。children 用此字段关联到具体面板/标签页 */
  regionKey?: string
}
```
- Grid/Table 仍用 `columnIndex?: number`（数字，无需 key 语义）
- Collapse/Tabs 用 `regionKey?: string`（字符串）
- 两者互不冲突，reducer 同时支持

#### 1.2 Grid 类型清理
```ts
// packages/core/src/components/grid/types.ts
export interface GridProps extends BaseLayoutComponentProps {
  /** 列配置。每项 1-24，sum(colSpans) ≤ 24，至少 1 列 */
  colSpans?: Array<{ id: string; span: number }>
  /** 间距 */
  gap?: number | [number, number]
  /** 保留 variant */
  variant?: 'grid' | 'flex'
}

// GridRowConfig / GridColConfig —— 整体删除
// rows?: GridRowConfig[]   —— 删除（无使用场景）
// cols?: GridColConfig[]   —— 删除（adapter 之前用，改为 colSpans 替代）
```
- **删除** `columns: number`（不再使用）
- **删除** `colWidths: number[]`（不再使用）
- **删除** `rows?: GridRowConfig[]`（未使用过）
- **删除** `cols?: GridColConfig[]`（adapter 中 Grid.tsx#L30 之前优先用 `cols`，改为 colSpans 后此字段多余）
- **删除** `GridRowConfig` / `GridColConfig` 接口

#### 1.3 Table（width 改为像素 — ⚠️ breaking change）
```ts
// packages/core/src/components/table/types.ts
export interface TableColumnConfig {
  id: string           // 稳定 key
  label: string
  width: number        // ⚠️ 像素值（之前是百分比 %）
}
export interface TableProps extends BaseLayoutComponentProps {
  columns: TableColumnConfig[]
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number
}
```
- **删除** `minWidth?: number`（像素制下无意义；可用 width 单一字段控制）
- ⚠️ **破坏性变更**：用户已有 schema 的 `width: 50`（意为 50%）将按 50px 渲染，**宽度视觉效果变化**
- **迁移策略**：本次不主动迁移数据；adapter 层若读不到 `id` 字段，给出运行期降级（按数组下标生成 id），但 width 单位变更**不自动迁移**。如需兼容，参考下文"兼容与迁移"章节的 `warnAndMigrate` 钩子

#### 1.4 Collapse
```ts
// packages/core/src/components/collapse/types.ts
export interface CollapsePanelConfig {
  id: string         // 内部稳定 key
  key: string        // antd Panel 的 key（唯一，children 用此关联）
  header: string
  disabled?: boolean
}
export interface CollapseProps extends BaseLayoutComponentProps {
  panels: CollapsePanelConfig[]
  defaultActiveKey?: string | string[]
  accordion?: boolean
  ghost?: boolean
}
```
- **删除** 旧的 `children: ReactNode`（运行时）—— 改由 region 系统 + 自身 children 推导
- children 中 FormFieldSchema 带 `regionKey`，匹配 `panels[].key`

#### 1.5 Tabs
```ts
// packages/core/src/components/tabs/types.ts
export interface TabPaneConfig {
  id: string
  key: string        // antd TabPane 的 key
  title: string
  disabled?: boolean
}
export interface TabsProps extends BaseLayoutComponentProps {
  tabs: TabPaneConfig[]
  defaultActiveKey?: string
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  centered?: boolean
}
```

### 2. 通用 ItemListEditor 组件（新增）

**文件**：`packages/core/src/propRenders/ItemListEditor.tsx`（新增）

**职责**：通用"键控列表"编辑器，4 个组件共用

**API**：
```ts
export interface ItemListField<T> {
  key: keyof T | string
  label: string
  kind: 'text' | 'number' | 'switch'
  min?: number
  max?: number
  placeholder?: string
  step?: number
  /** 占位 flex 比例，默认 1 */
  flex?: number
  /** 唯一性校验目标（如 'key'）：标记为唯一字段，输入时和列表其他项对比 */
  unique?: boolean
}

export interface ItemListEditorProps<T extends { id: string }> {
  value?: T[]
  onChange?: (v: T[]) => void
  fields: ItemListField<T>[]
  newItem: () => T
  /** 总和校验：返回错误消息或 null */
  validateTotal?: (items: T[]) => string | null
  /** 唯一性校验：返回错误消息或 null（内部对标记 unique 的字段全表去重） */
  validateUnique?: (items: T[]) => string | null
  /** 最小条目数（默认 0；Grid 建议设为 1） */
  minItems?: number
  addLabel?: string
  disabled?: boolean
  /** 是否支持 ↑↓ 调序（默认 true） */
  sortable?: boolean
}
```

**实现要点**：
- 使用 `useStyle().token(...)` + `var(--fe-*)`，**严格 Token 化**（`ColumnDropZone` 的 `check-tokens-disable` 豁免随文件删除而解除）
- 行布局：左 ↑↓（启用 sortable）、中 fields × N（按 `flex` 分配宽度）、右删除按钮
- 数字 input 用原生 `<input type="number">`
- 错误提示（`validateTotal` / `validateUnique` / `minItems`）统一展示在列表底部
- **id 自动生成**：调用外部工具 `genId()`（见 §6）

### 3. 通用 RegionPreview 组件（新增，替代 ColumnDropZone）

**文件**：`packages/core/src/designer/RegionPreview.tsx`（新增）

**职责**：画布中"区域"的统一视觉块 + droppable 容器，4 个组件共用

**API**：
```tsx
interface RegionPreviewProps {
  parent: FormFieldSchema
  /** 区域唯一标识（Grid/Table 用 columnIndex 字符串，Collapse/Tabs 用 panel.key/tab.key） */
  regionKey: string
  /** 该区域下的 children */
  items: FormFieldSchema[]
  /** 顶部标签文本（如 Collapse 面板 header、Tabs tab title）。空字符串则不显示标签栏 */
  regionLabel?: string
  /** 区域宽度。Grid: flex 比例字符串（如 "0 0 50%"）；Table: 像素值（如 200）；Collapse/Tabs: 100%（占满） */
  regionWidth?: number | string
  /** 顶部标签栏的背景色 token（默认 var(--fe-bg-tertiary)） */
  labelBg?: string
}
```

**实现要点**：
- `useDroppable({ id: \`${parent.id}__region_${regionKey}\` })`
- 顶部 24px 高的 header（标签文本居左 muted 字体）
- 主体 minHeight=60，dashed border，内部 `SortableContext` + `NestedField`
- **严格 Token 化**（不能继承 ColumnDropZone 的 `check-tokens-disable`）

### 4. 画布重构（ContainerPreview）

#### 4.1 Grid 分支
```tsx
const colSpans = (field.componentProps?.colSpans ?? []) as Array<{ id: string; span: number }>
const total = colSpans.reduce((s, c) => s + (c.span || 0), 0) || 24
return (
  <div ref={setNodeRef} style={containerStyle} data-grid-container>
    <div style={{ display: 'flex', flexDirection: 'row', gap: token('spacingSm'), minHeight: token('containerMinHeight') }}>
      {colSpans.map((col, i) => (
        <RegionPreview
          key={col.id}
          parent={field}
          regionKey={String(i)}
          items={childrenGrouped[i] || []}
          regionWidth={`0 0 ${(col.span / 24) * 100}%`}
        />
      ))}
    </div>
  </div>
)
```

#### 4.2 Table 分支
```tsx
const cols = (field.componentProps?.columns ?? []) as TableColumnConfig[]
return (
  <div ref={setNodeRef} style={containerStyle}>
    <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: token('fontSizeSm') }}>
      <thead>
        <tr>
          {cols.map(col => (
            <th key={col.id} style={{ width: `${col.width}px`, padding: token('spacingXs'), borderBottom: '1px solid var(--fe-border-primary)', textAlign: 'left' }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {cols.map((col, i) => (
            <td key={col.id} style={{ padding: token('spacingXs'), verticalAlign: 'top', width: `${col.width}px` }}>
              <RegionPreview
                parent={field}
                regionKey={String(i)}
                items={childrenGrouped[i] || []}
                regionWidth="100%"   {/* td 像素宽已固定，区域内部不再用 flex */}
              />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
    <div>...</div>
  </div>
)
```
- `tableLayout: 'fixed'` 是像素 width 生效的**必要条件**
- `<td>` 内的 RegionPreview **不再使用 flex 算宽度**，用 100% 占满

#### 4.3 Collapse 分支（**同时展开所有面板**）
```tsx
const panels = (field.componentProps?.panels ?? []) as CollapsePanelConfig[]
const grouped = groupByChildrenByKey(field.children, c => c.regionKey)
return (
  <div ref={setNodeRef} style={containerStyle}>
    {panels.length === 0 ? (
      <EmptyRegionPlaceholder text="请在右侧属性面板添加面板" />
    ) : (
      panels.map(panel => (
        <div key={panel.id} style={{ border: '1px solid var(--fe-border-light)', borderRadius: 'var(--fe-border-radius-sm)', marginBottom: token('spacingSm') }}>
          <RegionPreview
            parent={field}
            regionKey={panel.key}
            items={grouped[panel.key] || []}
            regionLabel={`▾ ${panel.header || '(未命名面板)'}${panel.disabled ? ' [禁用]' : ''}`}
            regionWidth="100%"
          />
        </div>
      ))
    )}
  </div>
)
```

#### 4.4 Tabs 分支（**同时展开所有 tab**）
```tsx
const tabs = (field.componentProps?.tabs ?? []) as TabPaneConfig[]
const grouped = groupByChildrenByKey(field.children, c => c.regionKey)
return (
  <div ref={setNodeRef} style={containerStyle}>
    {tabs.length === 0 ? (
      <EmptyRegionPlaceholder text="请在右侧属性面板添加标签页" />
    ) : (
      <>
        {/* 模拟 tab 标签条（仅展示，点击无效） */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--fe-border-light)', marginBottom: token('spacingSm'), gap: token('spacingXs') }}>
          {tabs.map(t => (
            <div key={t.id} style={{ padding: `${token('spacingXs')} ${token('spacingSm')}`, borderBottom: '2px solid var(--fe-primary)', fontSize: token('fontSizeSm'), color: 'var(--fe-text-primary)' }}>
              {t.title || '(未命名)'}
            </div>
          ))}
        </div>
        {tabs.map(tab => (
          <RegionPreview
            key={tab.id}
            parent={field}
            regionKey={tab.key}
            items={grouped[tab.key] || []}
            regionLabel={`Tab: ${tab.title}${tab.disabled ? ' [禁用]' : ''}`}
            regionWidth="100%"
          />
        ))}
      </>
    )}
  </div>
)
```

#### 4.5 清理 ColumnDropZone
- **删除** `packages/core/src/designer/ColumnDropZone.tsx`
- **删除** `useColumnResize` hook（彻底解决闪烁 bug）
- 替换引用方：`Designer.tsx` 不再 import `ColumnDropZone` / `useColumnResize`（之前就没有 import，只在 ContainerPreview 内部用）

#### 4.6 dnd id 统一迁移：`__col_${n}` → `__region_${n}`
涉及 [Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx) **4 处**：

| 位置 | 当前 | 改为 |
|------|------|------|
| L45 `resolveDropTarget` | `overId.match(/^(.+)__col_(\d+)$/)` | `overId.match(/^(.+)__region_(\w+)$/)` |
| L276 `handleDragOver` | `colMatch` 块（__col_） | `regionMatch` 块（__region_） |
| L334 `isValidCanvasTarget` 硬编码 `overStr.includes('__col_')` | `overStr.includes('__region_')` |
| L347 `handleDragEnd` | `colMatch` 块（__col_） | `regionMatch` 块（__region_） |

> RegionPreview 生成的 droppable id 形如 `${parent.id}__region_${regionKey}`，正则 `\w+` 同时匹配数字（Grid/Table）和字符串（Collapse/Tabs key）。

### 5. Reducer 扩展（regionKey）

#### 5.1 `DesignerAction` 类型扩展
[designer.ts#L134 / #L136](file:///d:/Repos/form_engine/packages/core/src/types/designer.ts)：
```ts
| { type: 'ADD_FIELD'; field: FormFieldSchema; index: number; parentId?: string; columnIndex?: number; regionKey?: string }
| { type: 'MOVE_FIELD'; fromIndex: number; toIndex: number; parentId?: string; fromParentId?: string; toParentId?: string; columnIndex?: number; regionKey?: string }
```

#### 5.2 `reducer.ts` 写入 regionKey
对照现有 `columnIndex` 写法（[reducer.ts#L135-L137](file:///d:/Repos/form_engine/packages/core/src/designer/reducer.ts#L135-L137) / [L179-L181](file:///d:/Repos/form_engine/packages/core/src/designer/reducer.ts#L179-L181)）：

```ts
case 'ADD_FIELD': {
  let fieldToAdd = action.field
  if (action.columnIndex !== undefined) {
    fieldToAdd = { ...fieldToAdd, columnIndex: action.columnIndex }
  }
  if (action.regionKey !== undefined) {        // ← 新增
    fieldToAdd = { ...fieldToAdd, regionKey: action.regionKey }
  }
  // ... 后续 ADD 逻辑不变
}

case 'MOVE_FIELD': {
  // ... removeFieldFromTree 取 removed
  let movedField = removed
  if (action.columnIndex !== undefined) {
    movedField = { ...movedField, columnIndex: action.columnIndex }
  }
  if (action.regionKey !== undefined) {        // ← 新增
    movedField = { ...movedField, regionKey: action.regionKey }
  }
  // 移出时（!action.toParentId）清空 regionKey
  if (!action.toParentId && movedField.regionKey !== undefined) {
    movedField = { ...movedField, regionKey: undefined }
  }
  // ...
}
```
- 同步 `Designer.tsx` `handleDragOver/End` 的 `dispatch` 调用，把识别到的 `regionKey` 传进 action

#### 5.3 Designer.tsx dnd 识别 regionKey
- 在 `resolveDropTarget` 命中 `__region_${k}` 时，**额外**根据 `parent.type` 决定返回 `columnIndex`（grid/table）还是 `regionKey`（collapse/tabs）
- 简化做法：保留 `regionKey` 字段统一返回，Grid/Table 渲染时取 `regionKey` 当 columnIndex 字符串（数字字符串 OK）
- 决定：**统一用 regionKey**。`ContainerPreview` 的 Grid 分支按 `regionKey`（数字字符串）分组；Table 同理；Collapse/Tabs 按 `regionKey`（真实字符串）分组。**`columnIndex` 字段废弃**（reducer 兼容性保留但 Grid/Table 改用 regionKey）
- **breaking change**：旧 schema 的 `columnIndex` 数据不再被消费；adapter 层若读不到 `regionKey`，**降级回 `columnIndex`**

### 6. 通用 `genId()` 工具

**文件**：`packages/core/src/utils/id.ts`（新增）

```ts
let _counter = 0
export function genId(prefix = 'id'): string {
  _counter++
  // 不依赖 type，纯递增 + 随机
  return `${prefix}_${Date.now()}_${_counter}_${Math.random().toString(36).slice(2, 6)}`
}
```
- 与 `reducer.ts` 现有的 `generateFieldId(type)` 解耦（后者带 `field_xxx_type_` 前缀，专为 FormField 主字段服务，不适合面板/tab id）
- 在 `utils/index.ts` 中 `export { genId } from './id'`

### 7. 属性面板

#### 7.1 Grid
```tsx
<FieldItem label="布局模式"><w.Select ... variant ... /></FieldItem>
<FieldItem label="间距"><w.NumberInput ... /></FieldItem>
<FieldItem label="内边距/外边距">...</FieldItem>
<FieldItem label="列管理" variant="group">
  <ItemListEditor<{ id: string; span: number }>
    value={colSpans}
    onChange={v => onChange('colSpans', v)}
    fields={[{ key: 'span', label: '宽度（1-24）', kind: 'number', min: 1, max: 24, step: 1 }]}
    newItem={() => ({ id: genId('col'), span: 8 })}
    validateTotal={items => {
      const sum = items.reduce((s, x) => s + (Number(x.span) || 0), 0)
      if (sum > 24) return `列宽总和 ${sum} 超过 24`
      return null
    }}
    minItems={1}    // 至少保留 1 列
  />
</FieldItem>
```

#### 7.2 Table
```tsx
<FieldItem label="行模式"><w.ButtonGroup dynamic/fixed /></FieldItem>
{rowMode === 'fixed' && <FieldItem label="固定行数"><w.NumberInput ... /></FieldItem>}
<FieldItem label="列管理" variant="group">
  <ItemListEditor<TableColumnConfig>
    value={columns}
    onChange={v => onChange('columns', v)}
    fields={[
      { key: 'label', label: '列标题', kind: 'text', placeholder: '列标题' },
      { key: 'width', label: '宽度(px)', kind: 'number', min: 20, max: 2000, step: 10 },
    ]}
    newItem={() => ({ id: genId('col'), label: `列${(columns?.length || 0) + 1}`, width: 120 })}
  />
</FieldItem>
```

#### 7.3 Collapse（带 key 唯一性校验 + defaultActiveKey 兜底）
```tsx
<FieldItem label="手风琴模式"><w.Switch ... /></FieldItem>
<FieldItem label="简洁模式"><w.Switch ... /></FieldItem>
<FieldItem label="默认展开"><w.Input placeholder="面板 key，多个用逗号" /></FieldItem>
<FieldItem label="面板管理" variant="group">
  <ItemListEditor<CollapsePanelConfig>
    value={panels}
    onChange={v => {
      // 兜底：defaultActiveKey 指向已删除的 panel.key 时清空
      const activeSet = collectActiveKeys(defaultActiveKey)
      const exists = v.some(p => activeSet.has(p.key))
      const patch: any = { panels: v }
      if (!exists) patch.defaultActiveKey = undefined
      onChange('panels', v)
      // 同步写 defaultActiveKey —— 走 onChange 多次或合并调用
    }}
    fields={[
      { key: 'header', label: '标题', kind: 'text', placeholder: '面板标题' },
      { key: 'key', label: 'Key', kind: 'text', placeholder: '唯一标识', unique: true },
      { key: 'disabled', label: '禁用', kind: 'switch', flex: 0 },
    ]}
    newItem={() => ({ id: genId('panel'), key: `panel_${(panels?.length || 0) + 1}`, header: `面板${(panels?.length || 0) + 1}`, disabled: false })}
    validateUnique={items => {
      const keys = items.map(x => x.key).filter(Boolean)
      const dup = keys.find((k, i) => keys.indexOf(k) !== i)
      return dup ? `面板 key "${dup}" 重复，请保证唯一` : null
    }}
  />
</FieldItem>
```

#### 7.4 Tabs（同上）
```tsx
// 与 Collapse 类似，区别：tab 标题字段叫 title，且 panel.key -> tab.key
// ItemListEditor 配置 title 字段 + key（unique: true）
```

> 关于 `onChange` 同步多字段：建议在 ItemListEditor 的 `onChange` 回调中由调用方决定是否联动写其他字段；如果需要联动重置 defaultActiveKey，调用方可在 `Props.tsx` 内的 `onChange('panels', v)` 之后**再 dispatch** 一次 UPDATE_FIELD 单独写 defaultActiveKey（这会增加 2 次 dispatch，但语义清晰；可用 debounce 合并）。

### 8. Adapter 渲染

#### 8.1 antd 桌面端
- **Grid** [adapter-antd/Grid.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Grid.tsx)：删除 `variant` / `rows` / `cols` 分支；按 `colSpans[i].span` 渲染 `Col span`
- **Table** [adapter-antd/Table.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Table.tsx)：列宽 `${col.width}px`；`<table style={{ tableLayout: 'fixed' }}>`；th/td 都加 `width`
- **Collapse** [adapter-antd/Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Collapse.tsx)：
  - 删除文件内本地定义的 `TabsProps` 接口（**L88-L100**）和 `CollapsePanelProps`（`import type { CollapseProps, CollapsePanelConfig } from '@form-engine/core'`）
  - 改用 `CollapsePanelConfig` 类型，按 `regionKey` 分组 children 后渲染 `Panel`
- **Tabs** [adapter-antd/Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Tabs.tsx)：
  - 删除文件内本地 `TabsProps`（**L88-L101**）和 `TabPaneProps`
  - 改用 `TabPaneConfig`，按 `regionKey` 分组 children 后渲染 `TabPane`

#### 8.2 antd-mobile（差异化处理）
- **Grid** [adapter-antd-mobile/Grid.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Grid.tsx)：保持 flex 实现，参数从 `columns: number` 改为按 `colSpans[i].span` 计算 `flex: 0 0 ${(span/24)*100}%`
- **Table** [adapter-antd-mobile/Table.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Table.tsx)：
  - 当前用 `<Card>` 列表（每行一个 Card）—— 保持
  - 列宽：移动端表格概念弱，width 像素仅作"卡片内字段顺序 + label 显示参考"，**不强校验**
  - 字段顺序按 `columns[].label` 排序渲染（label 决定卡片内显示顺序）
- **Collapse** [adapter-antd-mobile/Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Collapse.tsx)：
  - antd-mobile 的 `Collapse` 不需要显式 `Panel` 组件（自动按 children 渲染）
  - 数据流：panels.map(p => <CollapsePanel key={p.key} ... />) —— **Panel 包裹 children**
  - 若 antd-mobile `Collapse.Panel` 不存在（API 不同），用 map 渲染 header + content
- **Tabs** [adapter-antd-mobile/Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Tabs.tsx)：同 antd-mobile Collapse，按 panels/tabs 元数据渲染

> **实施前先验证 antd-mobile Collapse/Tabs 的 Panel/TabPane API**，避免假设错误。

### 9. 调色板默认值

| 组件 | defaultProps.componentProps |
|------|------------------------------|
| Grid | `{ colSpans: [{id: genId('col'), span: 12}, {id: genId('col'), span: 12}], gap: 16 }` |
| Table | `{ columns: [{id: genId('col'), label: '列1', width: 120}, {id: genId('col'), label: '列2', width: 120}], rowMode: 'dynamic' }` |
| Collapse | `{ panels: [{id: genId('panel'), key: 'panel_1', header: '面板一'}, {id: genId('panel'), key: 'panel_2', header: '面板二'}], accordion: false, ghost: false }` |
| Tabs | `{ tabs: [{id: genId('tab'), key: 'tab_1', title: '标签页一'}, {id: genId('tab'), key: 'tab_2', title: '标签页二'}] }` |

> 调色板创建新组件时调用 `genId()` 是不行的（每次拖出生成新 id 才对）。建议在 `palette.tsx` 中写死 `'col_1' / 'col_2'`，由 `FieldList` 层的 `createFieldFromPalette` 在生成 field 时统一刷新 id；或者直接在 `palette.tsx` 写死 `'col_1'`，`createFieldFromPalette` 检测到同 key 已存在就重生成。
> 简化：palette 写死 `'col_1' / 'col_2'`，第一次拖出时是 col_1/col_2；多次拖出多个 Grid 时第二个 Grid 的 id 在 `createFieldFromPalette` 内用 `genId('col')` 重生成。

### 10. 兼容与迁移

- **Grid 旧 `columns: number` / `colWidths: number[]`**：adapter 层兜底，缺省时回退
  ```ts
  const colSpans = props.colSpans
    ?? (Array.isArray(props.colWidths)
      ? props.colWidths.map((w, i) => ({ id: `legacy_${i}`, span: Math.round((w / 100) * 24) }))
      : (props.columns ? Array.from({ length: props.columns }, () => ({ id: 'legacy', span: 24 / props.columns })) : [{ id: 'def', span: 24 }]))
  ```
- **Collapse/Tabs 旧 palette** 的子 `type: 'collapse' / 'tabs'`：不主动迁移；若用户加载了旧 schema，panels/tabs 字段为空，按"空状态"提示
- **Table width %→px**：不主动迁移；运行时按像素渲染，可能看起来"宽度变小"
  - 可选：在 `useFieldSchema` 钩子里加一个 `migrateOnLoad` 钩子，遍历 `columns` 把 `width > 50` 的认为是百分比并按 800px 容器宽度换算（启发式，不强求）
- **columnIndex → regionKey**：reducer 兼容，ContainerPreview 优先读 regionKey，回退 columnIndex

### 11. 实施步骤

#### Step 1：基础设施
1. 新建 [id.ts](file:///d:/Repos/form_engine/packages/core/src/utils/id.ts)：`genId(prefix)`
2. [utils/index.ts](file:///d:/Repos/form_engine/packages/core/src/utils/index.ts)：export
3. 新建 [ItemListEditor.tsx](file:///d:/Repos/form_engine/packages/core/src/propRenders/ItemListEditor.tsx)
4. [propRenders/index.ts](file:///d:/Repos/form_engine/packages/core/src/propRenders/index.ts)：export
5. 新建 [RegionPreview.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/RegionPreview.tsx)
6. 删除 [ColumnDropZone.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/ColumnDropZone.tsx)

#### Step 2：Schema & Reducer 扩展
1. [schema.ts](file:///d:/Repos/form_engine/packages/core/src/types/schema.ts)：FormFieldSchema 新增 `regionKey?: string`
2. [designer.ts](file:///d:/Repos/form_engine/packages/core/src/types/designer.ts)：
   - `ADD_FIELD` 增 `regionKey?: string`
   - `MOVE_FIELD` 增 `regionKey?: string`
3. [reducer.ts](file:///d:/Repos/form_engine/packages/core/src/designer/reducer.ts)：
   - `ADD_FIELD` 写入 `regionKey`
   - `MOVE_FIELD` 写入 `regionKey` + 移出时清空

#### Step 3：Designer.tsx dnd 重构
1. [Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx)：
   - `resolveDropTarget` 正则 `__col_` → `__region_`
   - `handleDragOver` `colMatch` → `regionMatch`，dispatch 传 `regionKey`
   - `handleDragEnd` 同上
   - `isValidCanvasTarget` 硬编码 `__col_` → `__region_`

#### Step 4：4 个组件类型与属性面板
1. **Grid**：
   - [grid/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/grid/types.ts)：删除 `columns` / `colWidths` / `rows` / `cols` / `GridRowConfig` / `GridColConfig`；新增 `colSpans`
   - [grid/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/grid/Props.tsx)：接入 ItemListEditor，minItems=1
   - [grid/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/grid/palette.tsx)：默认 colSpans
2. **Table**：
   - [table/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/table/types.ts)：id + 像素 width；删除 minWidth
   - [table/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/table/Props.tsx)：接入 ItemListEditor + rowMode
   - [table/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/table/palette.tsx)：默认 columns 带 id
3. **Collapse**：
   - [collapse/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/collapse/types.ts)：新增 `CollapsePanelConfig` / `panels` 字段
   - [collapse/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/collapse/Props.tsx)：接入 ItemListEditor（key 唯一性校验 + defaultActiveKey 兜底）
   - [collapse/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/collapse/palette.tsx)：默认 panels
4. **Tabs**：
   - [tabs/types.ts](file:///d:/Repos/form_engine/packages/core/src/components/tabs/types.ts)：新增 `TabPaneConfig` / `tabs` 字段
   - [tabs/Props.tsx](file:///d:/Repos/form_engine/packages/core/src/components/tabs/Props.tsx)：接入 ItemListEditor
   - [tabs/palette.tsx](file:///d:/Repos/form_engine/packages/core/src/components/tabs/palette.tsx)：默认 tabs

#### Step 5：ContainerPreview 重写
[ContainerPreview.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/ContainerPreview.tsx)：
- Grid 分支：colSpans → flex 宽度 + RegionPreview
- Table 分支：columns[].width 像素 + tableLayout: fixed + RegionPreview（100%）
- Collapse 分支：panels + RegionPreview（**同时展开**）+ 空状态
- Tabs 分支：tabs + RegionPreview（**同时展开**）+ tab 标签条 + 空状态
- 辅助函数：`groupByChildrenByKey(children, getKey)`
- 辅助组件：`EmptyRegionPlaceholder`（token 化）

#### Step 6：Adapter 渲染

##### 桌面端 (adapter-antd)
1. [Grid.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Grid.tsx)：colSpans → Col span（删除 variant/rows/cols 分支）
2. [Table.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Table.tsx)：像素 width + tableLayout: fixed
3. [Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Collapse.tsx)：
   - 删除本地 `TabsProps` / `CollapsePanelProps` 接口
   - import `CollapsePanelConfig` from `@form-engine/core`
   - 按 regionKey 分组 children 渲染 Panel
4. [Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd/src/components/Tabs.tsx)：
   - 删除本地 `TabsProps` / `TabPaneProps`
   - import `TabPaneConfig` from `@form-engine/core`
   - 按 regionKey 分组 children 渲染 TabPane

##### 移动端 (adapter-antd-mobile，**先验证 API**)
1. [Grid.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Grid.tsx)：保持 flex，colSpans → flex 宽度
2. [Table.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Table.tsx)：保持 Card 列表；列宽像素仅作"字段显示顺序参考"
3. [Collapse.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Collapse.tsx)：
   - **实施前先查 antd-mobile Collapse.Panel 是否存在**
   - 若存在：`<Collapse><Collapse.Panel key={p.key} header={p.header}>{children}</Collapse.Panel></Collapse>`
   - 若不存在：自行用 `<div>` 渲染 header + content 列表
4. [Tabs.tsx](file:///d:/Repos/form_engine/packages/adapter-antd-mobile/src/components/Tabs.tsx)：类似 Collapse 处理 TabPane

#### Step 7：验证
1. 启动 example 跑通 4 个组件
2. **Grid 边界**：
   - 增/删列、修改 span、合计 ≤24 校验、合计 = 24 正常
   - **删除所有列后 minItems=1 拦截**
3. **Table 边界**：
   - 增/删列、改 label/像素 width
   - 验证 `tableLayout: 'fixed'` 后像素列宽生效
4. **Collapse 边界**：
   - 增/删面板、改 header/key
   - **key 重复时阻断保存（提示）**
   - **defaultActiveKey 指向已删除 key 时自动清空**
   - 画布同时展开所有面板
5. **Tabs 边界**：同 Collapse
6. **跨区域拖拽**：
   - 字段从面板 A 拖到面板 B → regionKey 切换
   - 字段从 Grid 列 0 拖到列 1 → regionKey 切换
7. **旧 schema 兼容**：
   - 含 `colWidths: [40, 60]` 的 Grid 仍渲染
   - 含 `columns: number` 的 Grid 仍渲染
   - 含 `type: 'collapse'` 子项的旧数据不报错（panels 空，显示空状态）
8. `pnpm build` / `pnpm check:tokens` 通过

---

## 文件变更总览

### 新增
| 路径 | 用途 |
|------|------|
| `packages/core/src/utils/id.ts` | `genId(prefix)` 工具 |
| `packages/core/src/propRenders/ItemListEditor.tsx` | 通用键控列表编辑器（4 个组件共用） |
| `packages/core/src/designer/RegionPreview.tsx` | 通用区域预览（替代 ColumnDropZone） |

### 修改
| 路径 | 关键变更 |
|------|----------|
| `packages/core/src/types/schema.ts` | FormFieldSchema 新增 `regionKey?: string` |
| `packages/core/src/types/designer.ts` | `ADD_FIELD` / `MOVE_FIELD` 增 `regionKey` 字段 |
| `packages/core/src/designer/reducer.ts` | 写入 `regionKey`；移出 region 容器时清空 |
| `packages/core/src/designer/Designer.tsx` | **4 处** `__col_` → `__region_`；dispatch 传 regionKey |
| `packages/core/src/propRenders/index.ts` | 导出 ItemListEditor |
| `packages/core/src/utils/index.ts` | 导出 genId |
| `packages/core/src/components/grid/types.ts` | `colSpans: {id, span}[]`；**删除** `columns` / `colWidths` / `rows` / `cols` / `GridRowConfig` / `GridColConfig` |
| `packages/core/src/components/grid/Props.tsx` | ItemListEditor，minItems=1，validateTotal≤24 |
| `packages/core/src/components/grid/palette.tsx` | 默认 colSpans |
| `packages/core/src/components/table/types.ts` | `id` + 像素 `width`；**删除** `minWidth` |
| `packages/core/src/components/table/Props.tsx` | ItemListEditor + rowMode |
| `packages/core/src/components/table/palette.tsx` | 默认 columns 带 id |
| `packages/core/src/components/collapse/types.ts` | `panels: CollapsePanelConfig[]` |
| `packages/core/src/components/collapse/Props.tsx` | ItemListEditor（unique key + defaultActiveKey 兜底） |
| `packages/core/src/components/collapse/palette.tsx` | 默认 panels |
| `packages/core/src/components/tabs/types.ts` | `tabs: TabPaneConfig[]` |
| `packages/core/src/components/tabs/Props.tsx` | ItemListEditor |
| `packages/core/src/components/tabs/palette.tsx` | 默认 tabs |
| `packages/core/src/designer/ContainerPreview.tsx` | 4 个分支重写用 RegionPreview；空状态 + tab 标签条模拟 |
| `packages/adapter-antd/src/components/Grid.tsx` | colSpans 渲染；删 variant/rows/cols 分支 |
| `packages/adapter-antd/src/components/Table.tsx` | 像素 width + tableLayout: fixed |
| `packages/adapter-antd/src/components/Collapse.tsx` | **删除本地** `TabsProps` / `CollapsePanelProps`；按 regionKey 分组 |
| `packages/adapter-antd/src/components/Tabs.tsx` | **删除本地** `TabsProps` / `TabPaneProps`；按 regionKey 分组 |
| `packages/adapter-antd-mobile/src/components/Grid.tsx` | colSpans → flex 宽度（保持 flex 实现） |
| `packages/adapter-antd-mobile/src/components/Table.tsx` | 保持 Card 列表；列宽仅作显示顺序参考 |
| `packages/adapter-antd-mobile/src/components/Collapse.tsx` | 渲染 Panel（如 antd-mobile API 兼容）；否则自渲染 |
| `packages/adapter-antd-mobile/src/components/Tabs.tsx` | 渲染 TabPane（先验 API） |

### 删除
| 路径 | 原因 |
|------|------|
| `packages/core/src/designer/ColumnDropZone.tsx` | 合并入 RegionPreview（**含 useColumnResize hook 彻底删除**），同时**解除其 `check-tokens-disable` 豁免**（RegionPreview 必须严格 Token 化） |

---

## 假设与决策记录

1. **通用抽象**：`ItemListEditor<T>` 4 个组件共用，区别仅在 `fields` 和 `newItem` 配置
2. **区域定位用 regionKey（字符串）**：Grid/Table 也改用 `regionKey`（columnIndex 字符串形式），统一后端；reducer 兼容 `columnIndex` 但不再写入
3. **droppable id 统一为 `__region_${key}`**：正则 `\w+` 同时匹配数字字符串（Grid/Table columnIndex）和真实字符串（Collapse/Tabs key）
4. **ItemListEditor 支持 ↑↓ 按钮调序**：使用 `arrayMove` 或简单索引交换；不引入 dndkit
5. **id 生成**：用 `genId(prefix)`（独立工具），不复用 `generateFieldId(type)`
6. **Grid 至少保留 1 列**：通过 `minItems={1}` 拦截
7. **Collapse/Tabs key 唯一性校验**：通过 `unique: true` 字段标记 + `validateUnique` 钩子
8. **Collapse/Tabs defaultActiveKey 兜底**：删除指向已删 key 的 activeKey 时清空
9. **Collapse/Tabs 画布视觉**：所有面板/标签页**同时展开**显示，便于编辑
10. **antd-mobile 适配器差异大**：实施前先验证 antd-mobile Collapse/Tabs Panel API；可能需要 fallback 到自渲染
11. **adapter 类型统一**：删除 antd Collapse/Tabs adapter 内本地 Props 接口，统一从 core types 导入
12. **`ColumnDropZone` 删除 = 解除 check-tokens-disable 豁免**：RegionPreview 必须 100% token 化
13. **Table width %→px 是 breaking change**：不自动迁移数据
14. **containerPreview 中旧 columnIndex 字段兼容**：Grid/Table 渲染时优先 regionKey，回退 columnIndex

---

## 验证步骤

- [x] `pnpm build` 通过，无 TS 报错
- [x] `pnpm check:tokens` 通过（重点验证 RegionPreview）
- [x] **Grid**：
  - 默认 2 列（span=12,12）合计=24 正常
  - 新增第 3 列 span=8 合计=32 → 提示超 24
  - 改 span 后实时反映
  - **删除所有列 → minItems 拦截，提示保留至少 1 列**
  - **删除到 0 时画布显示空状态**
- [x] **Table**：
  - 默认 2 列（label=列1/列2, width=120px），画布列宽 120px
  - 改 width=200，画布列宽变 200px（验证 `tableLayout: 'fixed'` 生效）
- [x] **Collapse**：
  - 默认 2 面板（key=panel_1/panel_2, header=面板一/二）
  - 新增第 3 面板、改 header → 画布出现第 3 块
  - **key 重复时（输入 panel_1 已有）→ 阻断保存，提示校验错误**
  - **defaultActiveKey 指向已删除 key → 自动清空**
  - 所有面板**同时展开**
- [x] **Tabs**：同 Collapse
- [x] **跨区域拖拽**：
  - 字段从面板 A 拖到面板 B → regionKey 切换
  - 字段从 Grid 列 0 拖到列 1 → regionKey 切换
- [x] **旧 schema 兼容**：columnIndex 兼容保留
- [x] **视觉**：4 个组件的列/区域编辑器样式一致、主题 Token 全覆盖、列/面板块边框清晰
- [x] **Token 严格化**：grep `ColumnDropZone` 在代码中无残留引用；`RegionPreview` 无任何硬编码颜色/间距
