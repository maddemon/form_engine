import type { FormFieldSchema, FormSchema, FormConfig, SubmitConfig } from './schema'
import type { FormEngineAdapter, DesignerWidgets } from './adapter'
import type React from 'react'

/**
 * 设计器内部状态：被选中字段的 id
 */
export type SelectedFieldId = string | null

/**
 * 设计器拖拽事件类型
 */
export interface DragStartEvent {
  fieldType: string       // 从控件库拖出时：字段类型
  source: 'palette'      // 来源：控件库
  field?: FormFieldSchema // 从画布拖出时：已有字段
}

export interface DragEndEvent {
  targetIndex: number     // 放置目标位置
}

/**
 * 控件库项
 */
export interface PaletteItem {
  type: FormFieldSchema['type']
  label: string
  icon?: string           // lucide icon name 或 emoji
  defaultProps?: Partial<FormFieldSchema>
  /** 拖入画布时合并到 field.componentProps 的额外数据 */
  extraData?: Record<string, unknown>
}

/**
 * 控件库分组
 */
export interface PaletteGroup {
  groupName: string
  items: PaletteItem[]
}

/**
 * 左侧面板扩展 Tab
 */
export interface SidePanelTab {
  key: string
  title: string
  icon: React.ReactNode
  content: React.ComponentType<SidePanelTabContentProps>
}

export interface SidePanelTabContentProps {
  fields: FormFieldSchema[]
  selectedFieldId: string | null
  dispatch: React.Dispatch<DesignerAction>
}

/**
 * 右侧属性面板扩展 Tab（只能配置当前选中组件的属性）
 */
export interface PropertyPanelTab {
  key: string
  title: string
  content: React.ComponentType<PropertyPanelTabContentProps>
}

export interface PropertyPanelTabContentProps {
  field: FormFieldSchema | null
  onUpdate: (patch: Partial<FormFieldSchema>) => void
  onUpdateProp: (key: string, value: unknown) => void
  widgets: DesignerWidgets & Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>>
  dispatch: React.Dispatch<DesignerAction>
}

/**
 * 设计器三栏面板宽度配置
 *
 * 设计动机：用户场景下容器总宽差异很大（PC 1440+ vs 笔记本 1280 vs 平板 1024），
 * 固定 px 宽度会"挤死"或"留白过多"。开放给用户指定是必要的。
 *
 * 取值规则：
 *  - `number`  → `${n}px`，但小于 `min` 时会被覆盖到 `min`
 *  - `string`  → 透传（支持 `'20%'`、`'18rem'`、`'min(280px, 22vw)'` 等合法 CSS 宽度）
 *  - 缺省     → 使用 token 默认值（`--fe-panel-field-list-width` / `--fe-panel-config-width`）
 */
export interface PanelWidths {
  /** 左侧调色板宽度（默认 token 220px，最小 160px） */
  palette?: number | string
  /** 右侧属性面板宽度（默认 token 280px，最小 240px） */
  properties?: number | string
}

/**
 * 设计器 Props
 */
export interface DesignerProps {
  /** 当前编辑的 schema（受控） */
  schema?: FormSchema
  /** schema 变化回调 */
  onSchemaChange?: (schema: FormSchema) => void
  /** 可选：自定义控件库分组（覆盖默认） */
  groups?: PaletteGroup[]
  /** 可选：排除的调色板组件类型列表（用于屏蔽系统自带组件，如 ['cascader', 'tree-select']） */
  excludeTypes?: string[]
  /** 可选：只读模式 */
  readOnly?: boolean
  /** 可选：当前平台适配器，用于设计器属性面板风格统一 */
  adapter?: FormEngineAdapter
  /**
   * 可选：左侧面板扩展 Tab（有值时自动切换为 Tabs 布局）
   * 竖向 icon-only Tabs，第一个 Tab 固定为组件库
   */
  sidePanelTabs?: SidePanelTab[]
  /**
   * 可选：右侧属性面板扩展 Tab（有值时自动切换为 Segment Tab 布局）
   * 只能配置当前选中组件的属性
   */
  propertyPanelTabs?: PropertyPanelTab[]
  /**
   * 可选：调色板 / 属性面板宽度
   * - 数字：px；小于最小值时按最小值兜底
   * - 字符串：透传 CSS 宽度（如 '20%'、'18rem'）
   * - 缺省：按 token 默认值 + 容器尺寸自动收敛
   */
  panelWidths?: PanelWidths
}

/**
 * 设计器内部 action（用于 useReducer）
 */
export type DesignerAction =
  | { type: 'SELECT_FIELD'; fieldId: string | null }
  | { type: 'ADD_FIELD'; field: FormFieldSchema; index: number; parentId?: string; columnIndex?: number; regionKey?: string }
  | { type: 'REMOVE_FIELD'; fieldId: string }
  | { type: 'MOVE_FIELD'; fromIndex: number; toIndex: number; parentId?: string; fromParentId?: string; toParentId?: string; columnIndex?: number; regionKey?: string }
  | { type: 'UPDATE_FIELD'; fieldId: string; patch: Partial<FormFieldSchema> }
  | { type: 'UPDATE_FORM_CONFIG'; patch: Partial<FormConfig> }
  | { type: 'UPDATE_SUBMIT_CONFIG'; patch: Partial<SubmitConfig> }
  | { type: 'COPY_FIELD'; fieldId: string }
  | { type: 'SET_SCHEMA'; schema: FormSchema }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'REORDER_FIELDS'; fields: FormFieldSchema[] }
