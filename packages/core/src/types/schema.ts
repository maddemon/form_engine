/**
 * Form Engine Schema 类型定义
 * 对应 schema-spec.md 规范 v0.1
 */

import type { FormFieldEvents } from './events'

// ============================
// 数据源
// ============================

export type DataSourceType = 'static' | 'remote'

export interface StaticDataSource {
  type: 'static'
  static: {
    options: OptionItem[]
  }
}

export interface RemoteDataSource {
  type: 'remote'
  remote: {
    config: {
      url?: string
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      dependencies?: string[]
      requiredDeps?: string[]
      labelField?: string
      valueField?: string
      resultPath?: string
      skipEmpty?: boolean
      [key: string]: unknown
    }
  }
}

export type FieldDataSource = StaticDataSource | RemoteDataSource

export interface OptionItem {
  label: string
  value: string | number
  disabled?: boolean
  children?: OptionItem[]
}

// ============================
// 校验规则
// ============================

export interface FormRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  len?: number
  pattern?: string
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'phone'
  validator?: string
}

// ============================
// 联动表达式
// ============================

export type VisibleWhen = string | Record<string, unknown> | null

// ============================
// 自定义组件
// ============================

export type CustomSource = 'registry' | 'remote' | 'inline'

export interface CustomComponent {
  source: CustomSource
  componentId?: string
  code?: string
  language?: 'jsx' | 'tsx'
  dependencies?: string[]
}

// ============================
// Mock 数据
// ============================

export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
  [key: string]: unknown
}

// ============================
// 字段 Schema
// ============================

export type FieldType =
  | 'input'
  | 'input-number'
  | 'textarea'
  | 'password'
  | 'select'
  | 'multi-select'      // 已从调色板移除，保留类型兼容
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'date'
  | 'date-range'
  | 'time'
  | 'datetime'
  | 'upload'
  | 'rate'
  | 'cascader'          // 已从调色板移除，保留类型兼容
  | 'tree-select'       // 已从调色板移除，保留类型兼容
  | 'button'
  | 'grid'
  | 'flex'
  | 'container'
  | 'collapse'
  | 'tabs'
  | 'text'
  | 'image'
  | 'divider'
  | 'title'
  | 'custom'
  | `custom:${string}`
  | 'table'

export interface FormFieldSchema {
  id?: string
  name: string
  type: FieldType
  label?: string
  placeholder?: string
  tooltip?: string
  defaultValue?: unknown
  hidden?: boolean | string
  disabled?: boolean | string
  readOnly?: boolean
  colSpan?: number
  order?: number
  newline?: boolean
  rules?: FormRule[]
  visibleWhen?: VisibleWhen
  requiredWhen?: VisibleWhen
  visibleIfExpr?: string
  requiredIfExpr?: string
  disabledIfExpr?: string
  componentProps?: Record<string, unknown>
  dataSource?: FieldDataSource
  custom?: CustomComponent
  mock?: FieldMock
  /** 事件配置 */
  events?: FormFieldEvents
  /** 子字段（仅容器组件使用，如 grid/flex/container/collapse/tabs） */
  children?: FormFieldSchema[]
  /** 所属列索引（仅 grid/table 子节点使用） */
  columnIndex?: number
}

// ============================
// 表单配置
// ============================

export interface FormConfig {
  layout: 'horizontal' | 'vertical' | 'inline'
  labelCol: { span: number }
  wrapperCol: { span: number }
  colon: boolean
  size: 'small' | 'middle' | 'large'
  labelAlign: 'left' | 'right'
  disabled?: boolean
  autoComplete?: string
  requiredMark?: boolean
  scenes?: {
    desktop?: { labelCol?: { span: number }; wrapperCol?: { span: number } }
    mobile?: { labelCol?: { span: number }; wrapperCol?: { span: number } }
  }
}

export const DEFAULT_LABEL_COL_SPAN = 5
export const DEFAULT_WRAPPER_COL_SPAN = 15
export const DEFAULT_FORM_CONFIG = {
  layout: 'vertical' as const,
  size: 'middle' as const,
  labelAlign: 'right' as const,
  labelCol: { span: DEFAULT_LABEL_COL_SPAN } as const,
  wrapperCol: { span: DEFAULT_WRAPPER_COL_SPAN } as const,
  colon: false,
} satisfies FormConfig

export interface SubmitConfig {
  text?: string
  align?: 'left' | 'center' | 'right'
  resetText?: string
  showReset?: boolean
}

// ============================
// 自定义组件注册表
// ============================

export interface RegisteredComponentProp {
  type: string
  default?: unknown
  description?: string
}

export interface RegisteredComponent {
  displayName: string
  icon?: string
  props?: Record<string, RegisteredComponentProp>
}

// ============================
// 完整 Schema
// ============================

export interface FormSchema {
  version?: string
  id?: string
  name?: string
  description?: string
  form: FormConfig
  fields: FormFieldSchema[]
  submit?: SubmitConfig
  componentRegistry?: Record<string, RegisteredComponent>
}
