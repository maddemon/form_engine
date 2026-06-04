import type { FormFieldSchema } from './schema'

/**
 * 事件处理类型
 */
export type EventHandlerType = 'expression' | 'action' | 'callback'

/**
 * 事件处理器
 * 三种处理方式互斥，通过 type 字段区分
 */
export interface EventHandler {
  type: EventHandlerType
  /** 内联表达式（type='expression'） */
  expression?: string
  /** 预定义动作名（type='action'），详见 events/actions.ts */
  action?: string
  /** 动作参数（type='action'） */
  params?: Record<string, unknown>
  /** 回调名（type='callback'），引用 FormRenderProps.callbacks 中的函数 */
  callback?: string
}

/**
 * 事件参数声明（用于设计器表达式编辑器提示）
 */
export interface EventParamDeclaration {
  name: string
  type: string
  description?: string
}

/**
 * 组件事件声明（供设计器属性面板展示）
 * 由各组件的 types.ts 导出 xxxEventDeclarations
 */
export interface EventDeclaration {
  /** 事件名（对应组件 prop 名，如 onChange / onSearch / beforeUpload） */
  name: string
  /** 显示标签 */
  label: string
  /** 描述 */
  description?: string
  /** 事件参数说明（用于表达式编辑器提示） */
  params?: EventParamDeclaration[]
  /**
   * 是否为异步事件
   * - true：resolver 包装为 Promise.resolve()，透传用户回调返回值
   * - false（默认）：resolver 丢弃回调返回值
   */
  async?: boolean
}

/**
 * 事件配置映射
 * 索引签名支持任意事件名
 */
export interface FormFieldEvents {
  onChange?: EventHandler
  onClick?: EventHandler
  onBlur?: EventHandler
  onFocus?: EventHandler
  /** 组件特定事件，如 onSearch, onVisibleChange, beforeUpload 等 */
  [key: string]: EventHandler | undefined
}

// ============================
// 表达式上下文变量（注入作用域）
// ============================

/**
 * $self：当前字段
 */
export interface $Self {
  name: string
  value: unknown
  schema: FormFieldSchema
  props: {
    disabled: boolean
    readOnly: boolean
    placeholder?: string
  }
}

/**
 * $form：表单级 API
 */
export interface $Form {
  values: Record<string, unknown>
  setFieldValue(name: string, value: unknown): void
  setFieldsValue(patch: Record<string, unknown>): void
  getFieldValue(name: string): unknown
  submit(): void
  reset(): void
  validate(name?: string): Promise<boolean>
}

/**
 * 解析后的回调签名
 * 透传原始事件参数，丢弃返回值（异步事件除外）
 */
export type ResolvedEventHandler = (...args: unknown[]) => unknown

/**
 * 用户回调函数表（签名由使用者决定）
 * FormRender callbacks prop 的类型
 */
export type EventCallbacks = Record<string, (...args: unknown[]) => unknown>
