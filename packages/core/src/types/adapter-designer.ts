/**
 * Form Engine Adapter — 设计器相关类型
 *
 * 定义属性面板小组件接口、属性编辑器配置、属性面板渲染 Props。
 */

import * as React from 'react'
import type { FieldDataSource, FormFieldSchema, OptionItem } from './schema'

// ============================
// 属性面板小组件接口（由 adapter 提供）
// ============================

/** 属性面板使用的基础小组件 */
export interface DesignerWidgets {
  /** 文本输入框 */
  Input: React.ComponentType<{
    value?: string | number
    onChange?: (v: string | number) => void
    placeholder?: string
    disabled?: boolean
    style?: React.CSSProperties
    /** 形态变体，antd v5.13+ 支持 `outlined`/`borderless`/`filled`/`underlined` */
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    /** 尺寸，antd 默认 `middle`，PropertyPanel 紧凑模式用 `small` */
    size?: 'small' | 'middle' | 'large'
  }>
  /** 多行文本 */
  TextArea: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    placeholder?: string
    disabled?: boolean
    rows?: number
    style?: React.CSSProperties
  }>
  /** 下拉选择 */
  Select: React.ComponentType<{
    value?: string
    onChange?: (v: string | undefined) => void
    options: { label: string; value: string }[]
    disabled?: boolean
    allowClear?: boolean
    style?: React.CSSProperties
  }>
  /** 勾选框 */
  Checkbox: React.ComponentType<{
    checked?: boolean
    onChange?: (v: boolean) => void
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 开关 */
  Switch: React.ComponentType<{
    checked?: boolean
    onChange?: (v: boolean) => void
    disabled?: boolean
    style?: React.CSSProperties
    /** 尺寸，antd 默认 `default`，PropertyPanel 紧凑模式用 `small` */
    size?: 'small' | 'default'
  }>
  /** 数字输入框 */
  NumberInput: React.ComponentType<{
    value?: number
    onChange?: (v: number) => void
    min?: number
    max?: number
    disabled?: boolean
    style?: React.CSSProperties
    /** 形态变体，antd v5.13+ 支持 `outlined`/`borderless`/`filled`/`underlined` */
    variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
    /** 尺寸，antd 默认 `middle`，PropertyPanel 紧凑模式用 `small` */
    size?: 'small' | 'middle' | 'large'
  }>
  /** 按钮 */
  Button: React.ComponentType<{
    children?: React.ReactNode
    onClick?: () => void
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
    color?: 'default' | 'primary' | 'danger' | 'warning'
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 树形数据编辑器（用于 cascader/tree-select 等） */
  TreeDataEditor: React.ComponentType<{
    value?: OptionItem[]
    onChange?: (v: OptionItem[]) => void
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 数据源编辑器（支持静态/远程，用于 select/radio/checkbox/cascader/tree-select 等） */
  DataSourceEditor: React.ComponentType<{
    value?: FieldDataSource
    onChange?: (v: FieldDataSource) => void
    disabled?: boolean
    style?: React.CSSProperties
    optionsType?: 'flat' | 'tree'
  }>
  /** 按钮组（用于少量选项的平铺选择，替代 Select） */
  ButtonGroup: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    options: { label: string; value: string }[]
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 表达式输入框（尾部 ƒ 图标，弹窗编辑，可插入字段名） */
  ExpressionInput: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    placeholder?: string
    disabled?: boolean
    /** 已存在的字段名称列表，弹窗中点击可插入光标位置 */
    fieldNames?: string[]
    style?: React.CSSProperties
  }>
  /** 颜色选择器 */
  ColorPicker: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    placeholder?: string
    disabled?: boolean
    allowClear?: boolean
    style?: React.CSSProperties
  }>
}

// ============================
// 属性编辑器类型
// ============================

/** 属性编辑器配置 */
export interface PropEditorConfig {
  /** 编辑器类型 */
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'options' | 'expression' | 'json'
  /** 标签 */
  label: string
  /** 默认值 */
  default?: unknown
  /** 选项（type=select 时使用） */
  options?: { label: string; value: unknown }[]
  /** 是否必填 */
  required?: boolean
  /** 描述信息 */
  description?: string
  /** 条件显示（根据其他属性值） */
  visibleWhen?: Record<string, unknown>
}

/** 属性面板渲染 Props */
export interface PropertyPanelRenderProps {
  /** 当前选中的字段 Schema */
  field: FormFieldSchema
  /** 字段更新回调 */
  onChange: (updatedField: FormFieldSchema) => void
  /** 所有字段（用于联动配置） */
  allFields?: FormFieldSchema[]
}