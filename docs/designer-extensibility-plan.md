# 设计器扩展机制方案

## 需求总结

### 左侧面板

- 竖向 Tabs，只显示 icon，不显示文字
- 第一个 Tab 固定是【组件库】（使用组件库图标）
- **无扩展**：保持现有 `FieldList` 样式，不显示 Tabs
- **有扩展**：显示竖向 Tabs，切换展示不同内容
- 用户注册 Tab 时提供 icon

### 右侧属性面板

- 顶部 Segment 样式（类似 example 项目 header 里的 设计/预览 切换器）
- 第一个 Tab 固定是【属性】（现有 PropertyPanel 内容）
- **无扩展**：保持现有样貌，不显示 Segment Tab
- **有扩展**：显示 Segment Tab
- 只能配置当前选中组件的属性

### 拖拽问题

- 自定义 Tab 中如何方便地拖拽内容到画布？
- 提供包裹组件 `DraggablePaletteItem`，用户只需包住即可获得拖拽能力

---

## 注册方式分析：Registry vs Props

### Registry（调用实例方法注册）

```ts
// 用户侧
sidePanelTabRegistry.register({ key: 'data-source', title: '数据源', icon: <Database />, content: DataSourcePanel })
propertyPanelTabRegistry.register({ key: 'style', title: '样式', content: StyleConfigPanel })

// Designer 内部
const tabs = sidePanelTabRegistry.getAll()    // 直接读
const rightTabs = propertyPanelTabRegistry.getAll()
```

### Props（通过组件属性传入）

```tsx
<Designer
  sidePanelTabs={[{ key: 'data-source', title: '数据源', icon: <Database />, content: DataSourcePanel }]}
  propertyPanelTabs={[{ key: 'style', title: '样式', content: StyleConfigPanel }]}
/>
```

### 对比

| 维度 | Registry | Props |
|------|----------|-------|
| **全局性** | 注册一次，所有 `<Designer>` 实例生效 ✅ | 每个 `<Designer>` 都要传入 ❌ |
| **使用简洁度** | 在入口处注册即可，无需改动组件树 ✅ | 需层层透传或确保调用方都有控制权 ❌ |
| **Tree-shaking** | 无法 tree-shake（已注册的代码会被打包） ❌ | 显式 import 可 tree-shake ✅ |
| **测试便利性** | 需要清理注册表（全局状态） ❌ | 纯 props，测试时直接传空数组 ✅ |
| **可发现性** | 用户可能不知道有注册表存在 ❌ | 看到 `<Designer>` 就知道可以传什么 ✅ |
| **运行时切换** | 无法动态切换不同 tabs（全局的） ❌ | 不同页面可传不同 tabs ✅ |
| **多实例隔离** | 全局状态，多实例共享 ❌ | props 天然隔离 ✅ |

### 推荐：Props 方案

结合我们自身的场景分析：

1. **多实例场景**：产品中可能同时有「订单表单编辑器」和「用户表单编辑器」，它们的扩展 tabs 可能不同。Props 可以天然隔离。

2. **按需加载**：Registry 方式下，即使某个页面的 Designer 不需要图片库，图片库的代码也会被注册和打包。

3. **使用更直观**：用户看到 `<Designer sidePanelTabs={...}>` 就能理解「哦，我可以在左侧加 Tab」。Registry 方式用户还需要知道有个全局注册表。

4. **与现有模式一致**：现有 `DesignerProps` 已经有 `groups`（自定义分组）、`excludeTypes`（排除组件）等 props 控制属性，新增 `sidePanelTabs`/`propertyPanelTabs` 风格统一。

**结论**：采用 **Props 方案**，扩展内容通过 `<Designer>` 组件的 props 传入。同时保留 Registry 作为备选能力（方便某些全局注册场景），但主推 Props 方式。

```tsx
// 最终 API

interface DesignerProps {
  // ... 现有属性 ...

  /** 左侧面板扩展 Tab（有值时自动切换为 Tabs 布局） */
  sidePanelTabs?: SidePanelTab[]

  /** 右侧属性面板扩展 Tab（有值时自动切换为 Segment Tab 布局） */
  propertyPanelTabs?: PropertyPanelTab[]
}

// 使用示例
<Designer
  schema={schema}
  onSchemaChange={setSchema}
  sidePanelTabs={[
    { key: 'image-library', title: '图片库', icon: <ImageIcon size={20} />, content: ImageLibraryPanel },
  ]}
  propertyPanelTabs={[
    { key: 'style', title: '样式', content: StyleConfigPanel },
  ]}
/>
```

---

## 核心设计：拖拽方案

自定义 Tab（如 ImagePanel）中的内容需要拖入画布。当前拖拽依赖 `@dnd-kit/core` 的 `DndContext`，整个 Designer 只有一个 `DndContext` 包裹了左侧面板和画布。自定义 Tab 的内容也在这个 `DndContext` 内部。

**方案**：暴露 `DraggablePaletteItem` 包裹组件

```tsx
// 用户代码：ImagePanel 中
<DraggablePaletteItem fieldType="image" label="风景图1" extraData={{ src: 'https://xxx.jpg' }}>
  <img src="https://xxx.jpg" style={{ width: 80, height: 60 }} />
</DraggablePaletteItem>
```

`DraggablePaletteItem` 内部使用 `useDraggable`，设置 `data: { source: 'palette', fieldType, label, defaultProps, extraData }`，与现有 `PaletteItemCard` 走完全相同的拖拽路径。用户无需关心 DndContext、data 格式等细节。

---

## 方案设计

### 一、左侧面板 Tabs 化

#### 1.1 数据结构

```ts
export interface SidePanelTab {
  /** Tab 唯一标识 */
  key: string
  /** Tab 标题（tooltip 显示） */
  title: string
  /** Tab 图标（必填，因为只显示图标） */
  icon: React.ReactNode
  /** Tab 内容组件 */
  content: React.ComponentType<SidePanelTabContentProps>
}

export interface SidePanelTabContentProps {
  /** 当前画布字段列表 */
  fields: FormFieldSchema[]
  /** 当前选中字段 ID */
  selectedFieldId: string | null
  /** dispatch */
  dispatch: React.Dispatch<DesignerAction>
}
```

不设 order 字段，按注册顺序排列在组件库 Tab 之后。

#### 1.2 传入方式

```tsx
<Designer
  sidePanelTabs={[
    { key: 'data-source', title: '数据源', icon: <Database size={20} />, content: DataSourcePanel },
    { key: 'image-library', title: '图片库', icon: <ImageIcon size={20} />, content: ImageLibraryPanel },
  ]}
/>
```

#### 1.3 渲染逻辑

`FieldList` 改造：

- **无扩展时**（`sidePanelTabs` prop 为空或未传）：保持现有渲染，不显示 Tabs
- **有扩展时**：顶部竖向 icon Tabs + 内容区
  - 第一个 Tab 固定为【组件库】图标，选中时渲染现有组件库内容（`PaletteGroup[]`）
  - 后续 Tab 从 `sidePanelTabs` prop 获取，选中时渲染自定义 `content`
  - Tab 栏竖向排列，只显示 icon，hover 时 tooltip 显示 title

结构示意：

```
┌─────────┬────────────────┐
│  🧩     │                │
│  📊     │   Tab Content  │
│  🖼️     │                │
│         │                │
└─────────┴────────────────┘
```

#### 1.4 组件库 Tab 的扩展

现有能力保持不变：
- `customComponentRegistry.register()` 注册自定义组件 → 自动出现在组件库
- `DesignerProps.excludeTypes` 隐藏已有组件
- `DesignerProps.groups` 自定义分组

不开放组件库的渲染样式自定义。

### 二、右侧属性面板 Tabs 化

#### 2.1 数据结构

```ts
export interface PropertyPanelTab {
  /** Tab 唯一标识 */
  key: string
  /** Tab 标题 */
  title: string
  /** Tab 内容组件（只能配置选中组件的属性） */
  content: React.ComponentType<PropertyPanelTabContentProps>
}

export interface PropertyPanelTabContentProps {
  /** 当前选中的字段（null 表示未选中） */
  field: FormFieldSchema | null
  /** 更新字段属性 */
  onUpdate: (patch: Partial<FormFieldSchema>) => void
  /** 更新 componentProps 中的某个 key */
  onUpdateProp: (key: string, value: unknown) => void
  /** DesignerWidgets */
  widgets: Required<DesignerWidgets>
  /** dispatch */
  dispatch: React.Dispatch<DesignerAction>
}
```

#### 2.2 传入方式

```tsx
<Designer
  propertyPanelTabs={[
    { key: 'style', title: '样式', content: StyleConfigPanel },
    { key: 'advanced', title: '高级', content: AdvancedConfigPanel },
  ]}
/>
```

#### 2.3 渲染逻辑

`PropertyPanel` 改造：

- **无扩展时**（`propertyPanelTabs` prop 为空或未传）：保持现有渲染
- **有扩展时**：
  - 未选中字段：显示 FormConfigPanel（不显示 Tabs）
  - 选中字段：顶部 Segment Tab 栏 + 内容区
  - 第一个 Tab 固定为【属性】（渲染现有 PropertyPanel 内容）
  - 后续 Tab 从 `propertyPanelTabs` prop 获取

Segment Tab 栏样式参考 example 项目的 header 设计/预览切换器。

### 三、配置后更新控件的数据流

扩展属性的数据存储在 `field.componentProps` 中。

```
用户修改属性 → tab 的 onUpdateProp(key, value)
           → dispatch({ type: 'UPDATE_FIELD', fieldId, patch: { componentProps: { ...field.componentProps, [key]: value } } })
           → reducer 更新 schema
           → Canvas 重新渲染组件
           → 组件通过 componentProps 读取新值
```

`onUpdateProp` 封装了 `componentProps` 合并逻辑，用户无需手动处理展开。`onUpdate` 直接更新 schema 顶层字段。

### 四、`PaletteItem` / `PaletteDragData` 增加 `extraData`

```ts
export interface PaletteItem {
  type: FormFieldSchema['type']
  label: string
  icon?: string
  defaultProps?: Partial<FormFieldSchema>
  /** 拖入画布时合并到 field.componentProps 的额外数据 */
  extraData?: Record<string, unknown>
}
```

- `PaletteDragData` 同步增加 `extraData?: Record<string, unknown>`
- `createFieldFromPalette()` 将 `extraData` 合并到 `componentProps`
- `toPaletteItem()` 转换时保留 `extraData`

---

## 实现步骤

| Step | 内容 | 文件 |
|------|------|------|
| 1 | 新增数据类型（`SidePanelTab` / `SidePanelTabContentProps`、`PropertyPanelTab` / `PropertyPanelTabContentProps`） | `packages/core/src/types/designer.ts` |
| 2 | 实现 `DraggablePaletteItem` 包裹组件 | `packages/core/src/designer/DraggablePaletteItem.tsx` |
| 3 | 扩展数据类型（`PaletteItem.extraData`、`PaletteDragData.extraData`） | `packages/core/src/types/designer.ts`、`packages/core/src/types/designer-drag.ts` |
| 4 | DesignerProps 新增 `sidePanelTabs` / `propertyPanelTabs` | `packages/core/src/designer/Designer.tsx` |
| 5 | 左侧 FieldList 改造为条件 Tabs | `packages/core/src/designer/FieldList.tsx` |
| 6 | 右侧 PropertyPanel 改造为条件 Segment Tab | `packages/core/src/designer/PropertyPanel.tsx` |
| 7 | 导出公共 API | `packages/core/src/index.ts` |
| 8 | 编译验证 | `pnpm build` + `pnpm check:tokens` |

---

## 文件变更清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `packages/core/src/designer/DraggablePaletteItem.tsx` | 可拖拽调色板项包裹组件 |
| 修改 | `packages/core/src/types/designer.ts` | `DesignerProps` 增加 `sidePanelTabs`/`propertyPanelTabs`，`PaletteItem` 增加 `extraData` |
| 修改 | `packages/core/src/types/designer-drag.ts` | `PaletteDragData` 增加 `extraData`、`toPaletteItem` 保留 |
| 修改 | `packages/core/src/designer/Designer.tsx` | 接收 `sidePanelTabs`/`propertyPanelTabs` props |
| 修改 | `packages/core/src/designer/FieldList.tsx` | 条件 Tabs 布局、`createFieldFromPalette` 合并 `extraData` |
| 修改 | `packages/core/src/designer/PropertyPanel.tsx` | 条件 Segment Tab 布局 |
| 修改 | `packages/core/src/index.ts` | 导出新增类型和组件 |