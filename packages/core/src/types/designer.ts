import type { FormFieldSchema, FormSchema, FormConfig, SubmitConfig } from './schema'
import type { FormEngineAdapter } from './adapter'

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
}

/**
 * 控件库分组
 */
export interface PaletteGroup {
  groupName: string
  items: PaletteItem[]
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
}

/**
 * 设计器内部 action（用于 useReducer）
 */
export type DesignerAction =
  | { type: 'SELECT_FIELD'; fieldId: string | null }
  | { type: 'ADD_FIELD'; field: FormFieldSchema; index: number; parentId?: string }
  | { type: 'REMOVE_FIELD'; fieldId: string }
  | { type: 'MOVE_FIELD'; fromIndex: number; toIndex: number; parentId?: string; fromParentId?: string; toParentId?: string }
  | { type: 'UPDATE_FIELD'; fieldId: string; patch: Partial<FormFieldSchema> }
  | { type: 'UPDATE_FORM_CONFIG'; patch: Partial<FormConfig> }
  | { type: 'UPDATE_SUBMIT_CONFIG'; patch: Partial<SubmitConfig> }
  | { type: 'COPY_FIELD'; fieldId: string }
  | { type: 'SET_SCHEMA'; schema: FormSchema }
  | { type: 'UNDO' }
  | { type: 'REDO' }
