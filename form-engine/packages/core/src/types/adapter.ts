import React from 'react'
import type { FormFieldSchema, OptionItem, FieldType } from './schema'

/**
 * 字段渲染组件的 props 协议
 * 所有 adapter 的组件都遵循这个接口
 */
export interface FieldComponentProps {
  value?: unknown
  onChange?: (value: unknown) => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  options?: OptionItem[]
  fieldSchema: FormFieldSchema
  [key: string]: unknown
}

/**
 * 字段渲染函数类型
 * adapter 不只是组件映射，还要处理 props 转换
 */
export type FieldRendererFn = (props: FieldComponentProps) => React.ReactElement

/**
 * 设计器属性面板所用小组件的 props 协议（精简版）
 */
export interface DesignerInputProps {
  value?: string | number
  onChange?: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}
export interface DesignerSelectProps {
  value?: string
  onChange?: (value: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}
export interface DesignerCheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}
export interface DesignerNumberProps {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  style?: React.CSSProperties
}

/**
 * 设计器小组件集合
 * 每个 adapter 实现自己的版本，让属性面板风格统一
 */
export interface DesignerWidgets {
  Input: React.ComponentType<DesignerInputProps>
  Select: React.ComponentType<DesignerSelectProps>
  Checkbox: React.ComponentType<DesignerCheckboxProps>
  NumberInput: React.ComponentType<DesignerNumberProps>
}

/**
 * Adapter 接口
 * 将 field.type 映射为渲染函数（不是组件）
 * 渲染函数负责把 fieldSchema + value + onChange 转换成对应 UI 库的组件
 */
export interface FormAdapter {
  [fieldType: string]: FieldRendererFn
  /** 设计器属性面板使用的小组件（可选，未提供时使用原生 HTML 兜底） */
  _designerWidgets?: DesignerWidgets
}
