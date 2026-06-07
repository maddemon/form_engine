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
import type { BridgeProviderProps } from '../styles/themeBridge'
import type { FieldDataSource, FormConfig, FormFieldSchema, FormRule, OptionItem, ValidateResult } from './schema'

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
  default: FieldRendererFn

  /** 设计器属性面板小组件 */
  designerWidgets?: DesignerWidgets

  /**
   * 主题桥接 Provider
   *
   * adapter 可选提供，用于将宿主 UI 库的主题 Token 同步到 Form Engine 的 --fe-* CSS 变量。
   * Designer / FormRender 会在内部自动包裹此 Provider，消费者无需手动处理。
   *
   * @example
   * ```ts
   * // adapter-antd 内部
   * import { AntdBridgeProvider } from './themeBridge'
   * export const antdAdapter: FormEngineAdapter = {
   *   bridgeProvider: AntdBridgeProvider,
   *   // ...
   * }
   * ```
   */
  bridgeProvider?: React.ComponentType<BridgeProviderProps>

  /**
   * Form 容器组件（可选）
   * 不提供时引擎使用原生 <form> 元素
   */
  FormWrapper?: React.ComponentType<FormWrapperProps>

  /**
   * FormItem 包裹组件（可选）
   * 不提供时引擎使用内置 DefaultFormItem（label + error 渲染）
   */
  FormItem?: React.ComponentType<FormItemProps>

  /**
   * 校验函数（可选）
   * 不提供时引擎使用内置 validateForm() 兜底
   */
  validate?: ValidateFn
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

/** 属性面板渲染 Props */
export interface PropertyPanelRenderProps {
  /** 当前选中的字段 Schema */
  field: FormFieldSchema
  /** 字段更新回调 */
  onChange: (updatedField: FormFieldSchema) => void
  /** 所有字段（用于联动配置） */
  allFields?: FormFieldSchema[]
}
