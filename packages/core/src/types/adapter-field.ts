/**
 * Form Engine Adapter — 字段渲染相关类型
 *
 * 定义字段组件 Props、渲染函数类型、设备场景。
 */

import * as React from 'react'
import type { FormFieldSchema, FormRule, OptionItem } from './schema'

// ============================
// 字段渲染相关类型
// ============================

/** 字段组件的 Props（adapter 组件接收的参数） */
export interface FieldComponentProps {
  /** 字段值 */
  value?: unknown
  /** 值变化回调 */
  onChange?: (value: unknown) => void
  /** 字段 Schema */
  fieldSchema: FormFieldSchema
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 选项列表（select / radio / checkbox 等） */
  options?: OptionItem[]
  /** 是否必填 */
  required?: boolean
  /** 校验规则 */
  rules?: FormRule[]
  /** 校验状态 */
  validateStatus?: 'error' | undefined
  /** 校验错误提示 */
  help?: string
}

/** 字段渲染函数类型（adapter 组件映射使用） */
export type FieldRendererFn = (props: FieldComponentProps) => React.ReactElement

/** 通用组件渲染函数（支持 ReactNode 返回值，用于自定义组件覆盖） */
export type ComponentRenderFn = (props: FieldComponentProps) => React.ReactNode

/** 设备场景 */
export type DeviceScene = 'desktop' | 'mobile'