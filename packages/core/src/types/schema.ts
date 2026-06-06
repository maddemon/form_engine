/**
 * Form Engine Schema 类型定义
 * 对应 schema-spec.md 规范 v0.1
 */

import type { componentRegistry } from '../components'
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
// 校验结果
// ============================

export interface ValidateResult {
  valid: boolean
  /** 错误信息列表，按 field.name 索引 */
  errors: Record<string, string[]>
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
}

// ============================
// 字段 Schema
// ============================

/** 字段类型（内置类型从 componentRegistry 派生，支持 custom / custom:xxx 扩展） */
export type FieldType = keyof typeof componentRegistry | 'custom' | `custom:${string}`

export interface FormFieldSchema {
  id: string
  name: string
  type: FieldType
  label?: string
  placeholder?: string
  tooltip?: string
  /** 静态帮助文本，始终显示在字段下方（映射到 antd Form.Item extra） */
  help?: string
  defaultValue?: unknown
  hidden?: boolean | string
  disabled?: boolean | string
  readOnly?: boolean
  /** 是否隐藏标签 */
  labelHidden?: boolean
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
  children: FormFieldSchema[]
  /** 所属列索引（仅 grid/table 子节点使用） */
  columnIndex?: number
  /** 所属区域 key（仅在 region 容器内有效：collapse/tabs）。children 用此字段关联到具体面板/标签页 */
  regionKey?: string
}

// ============================
// 表单配置
// ============================

export interface FormConfig {
  colon: boolean
  size: 'small' | 'middle' | 'large'
  disabled?: boolean
  autoComplete?: string
  requiredMark?: boolean | 'optional'
  desktop: {
    layout: 'horizontal' | 'vertical' | 'inline'
    labelAlign: 'left' | 'right'
    labelCol: { span: number }
    wrapperCol: { span: number }
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    pageBackground?: string
  }
  mobile: {
    layout: 'horizontal' | 'vertical'
    pageBackground?: string
  }
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
  componentRegistry?: Record<string, RegisteredComponent>
}
