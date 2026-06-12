/**
 * Form Engine Adapter — Form / FormItem 适配器类型
 *
 * 定义 Form 容器、FormItem 包裹组件的 Props 以及校验函数类型。
 */

import * as React from 'react'
import type { FormConfig, FormFieldSchema, FormRule, ValidateResult } from './schema'
import type { DeviceScene } from './adapter-field'

// ============================
// Form / FormItem 适配器类型
// ============================

/** Form 容器组件 Props */
export interface FormWrapperProps {
  /** 表单配置 */
  formConfig: FormConfig
  /** 适配场景 */
  scene: DeviceScene
  /** 表单提交事件 */
  onSubmit?: () => void
  /** 子元素 */
  children: React.ReactNode
  /** CSS 类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
}

/**
 * FormItem 包裹组件 Props — 对齐 antd Form.Item 核心属性
 *
 * 术语注意：
 * - FormItemProps.help = 静态帮助文本（映射到 antd Form.Item extra）
 * - FieldComponentProps.help = 校验错误提示（映射自 errors[0]）
 * 两者含义不同，FieldRenderer 改造后校验展示统一由 FormItem 处理
 */
export interface FormItemProps {
  /** 字段名称（受控模式下不用于绑定，仅做标识） */
  name?: string
  /** 标签文本 */
  label?: string
  /** 是否隐藏标签 */
  labelHidden?: boolean
  /** 校验规则（仅用于 FormItem 展示用途，如 antd 的校验样式标记；实际校验由引擎 validate 机制执行） */
  rules?: FormRule[]
  /** 是否必填（显示必填标记） */
  required?: boolean
  /** 校验状态 */
  validateStatus?: 'error' | 'warning' | 'success' | undefined
  /** 校验错误信息（仅校验失败时传入） */
  errors?: string[]
  /** 静态帮助文本（始终显示在字段下方，不被校验错误覆盖） */
  help?: string
  /** 提示信息（label 旁的问号图标提示） */
  tooltip?: string
  /** 表单配置（含 layout/colon/labelCol/wrapperCol 等） */
  formConfig: FormConfig
  /** 适配场景 */
  scene: DeviceScene
  /** 子元素 */
  children: React.ReactNode
}

/** 校验函数类型（adapter 可选提供，不提供时引擎使用内置 validateForm 兜底） */
export type ValidateFn = (
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>,
  name?: string,
) => Promise<ValidateResult>