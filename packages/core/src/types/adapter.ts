/**
 * Form Engine Adapter 接口定义
 *
 * Adapter 负责将 Form Engine 的字段类型映射到具体的 UI 库组件。
 *
 * 核心原则：
 * - 纯对象，无 Proxy，无全局状态
 * - 显式传入，谁用谁传
 * - scene 标明适配场景，由调用方按需选择
 */

import * as React from 'react'

// ============================
// 字段渲染相关类型
// ============================

/** 字段组件的 Props */
export interface FieldComponentProps {
  /** 字段值 */
  value?: any
  /** 值变化回调 */
  onChange?: (value: any) => void
  /** 字段 Schema */
  fieldSchema?: any
  /** 字段名称 */
  name?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 其他属性 */
  [key: string]: any
}

/** 字段渲染函数类型 */
export type FieldRendererFn = (props: FieldComponentProps) => React.ReactElement

/** 设备场景 */
export type DeviceScene = 'desktop' | 'mobile'

// ============================
// 属性面板编辑器类型
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

// ============================
// Adapter 接口
// ============================

/**
 * Form Engine Adapter 接口
 *
 * 每个 UI 库（antd、antd-mobile 等）实现一个 adapter。
 * Adapter 是一个纯对象，无 Proxy、无全局注册。
 *
 * 使用方式：
 * ```tsx
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
 *
 * // 设计/预览：传两个 adapter，框架按 scene 自动切换
 * <Designer desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} />
 * <FormRender desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} scene={scene} />
 *
 * // 只传一个时，无论 scene 都使用它
 * <Designer desktopAdapter={antdAdapter} />
 * ```
 */
export interface FormEngineAdapter {
  /** Adapter 名称，如 'antd'、'antd-mobile' */
  name: string

  /** 适配场景 */
  scene: DeviceScene

  /**
   * 字段组件映射：field.type → FieldRendererFn
   *
   * key 为小写字段类型（如 'input'、'select'、'date-picker'），
   * value 为对应的渲染函数。
   */
  components: Record<string, FieldRendererFn>

  /** 兜底渲染函数，未知字段类型时使用 */
  default?: FieldRendererFn

  /** 设计器属性面板小组件 */
  designerWidgets?: DesignerWidgets
}

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
  }>
  /** 多行文本 */
  TextArea?: React.ComponentType<{
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
    onChange?: (v: string) => void
    options: { label: string; value: string }[]
    disabled?: boolean
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
  }>
  /** 数字输入框 */
  NumberInput: React.ComponentType<{
    value?: number
    onChange?: (v: number) => void
    min?: number
    max?: number
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 按钮 */
  Button?: React.ComponentType<{
    children?: React.ReactNode
    onClick?: () => void
    type?: 'default' | 'primary' | 'danger' | 'dashed'
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 选项编辑器（用于 select/radio/checkbox 等） */
  OptionsEditor?: React.ComponentType<{
    value?: { label: string; value: string }[]
    onChange?: (v: { label: string; value: string }[]) => void
    disabled?: boolean
    style?: React.CSSProperties
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
  ExpressionInput?: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    placeholder?: string
    disabled?: boolean
    /** 已存在的字段名称列表，弹窗中点击可插入光标位置 */
    fieldNames?: string[]
    style?: React.CSSProperties
  }>
}

/** 属性面板渲染 Props */
export interface PropertyPanelRenderProps {
  /** 当前选中的字段 Schema */
  field: any
  /** 字段更新回调 */
  onChange: (updatedField: any) => void
  /** 所有字段（用于联动配置） */
  allFields?: any[]
}
