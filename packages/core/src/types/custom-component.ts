/**
 * 自定义组件类型定义
 * 支持开发者注册自定义组件到设计器
 */

import type * as React from 'react'
import type { EventDeclaration } from './events'

/**
 * 属性编辑器 Widget 类型
 * - input: 文本输入框
 * - textarea: 多行文本
 * - number: 数字输入框
 * - select: 下拉选择
 * - checkbox: 勾选框
 * - switch: 开关
 * - json: JSON 编辑器
 * - options: 选项编辑器（编辑 OptionItem[]，用于 select/radio/checkbox 等）
 * - custom: 自定义组件（需指定 customWidget 名称）
 */
export type PropertyWidgetType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'json'
  | 'options'
  | 'custom'

/**
 * 属性配置项
 * 定义字段的单个属性如何在属性面板中渲染
 */
export interface PropertyConfigItem {
  /** 属性名（对应 field.props 中的 key） */
  key: string
  
  /** 显示标签 */
  label: string
  
  /** 使用的 widget 类型 */
  widget: PropertyWidgetType
  
  /** widget 的配置项（不同类型的 widget 有不同的配置） */
  widgetProps?: PropertyWidgetProps
  
  /** 分组名称（在属性面板中按组折叠显示） */
  group?: string
  
  /** 是否必填 */
  required?: boolean
  
  /** 描述信息（显示在标签旁边或 tooltip） */
  description?: string
  
  /** 
   * 显示条件
   * 根据其他属性值决定是否显示此属性
   * 例如：{ visibleWhen: { mode: 'multiple' } } 表示只有当 mode === 'multiple' 时才显示
   */
  visibleWhen?: Record<string, unknown>
}

/**
 * Widget 配置
 * 不同类型的 widget 有不同的配置项
 */
export interface PropertyWidgetProps {
  /** 占位符（input/textarea） */
  placeholder?: string
  
  /** 选项列表（select） */
  options?: { label: string; value: string | number | boolean }[]
  
  /** 最小值（number） */
  min?: number
  
  /** 最大值（number） */
  max?: number
  
  /** 步长（number） */
  step?: number
  
  /** 自定义 widget 名称（widget='custom' 时使用） */
  customWidget?: string
  
  /** 自定义 widget 的额外 props（传递给自定义 widget 组件） */
  customWidgetProps?: Record<string, unknown>
  
  /** JSON 编辑器的配置（widget='json' 时使用） */
  jsonConfig?: {
    /** 是否显示折叠按钮 */
    collapsible?: boolean
    /** 是否格式化显示 */
    formatted?: boolean
  }
}

/**
 * 自定义组件配置
 */
export interface CustomComponentConfig {
  /** 组件类型标识（唯一，必须以 'custom:' 开头） */
  type: `custom:${string}`
  
  /** 显示名称 */
  label: string
  
  /** 图标（React 节点或图标名称） */
  icon?: React.ReactNode | string
  
  /** 分类（显示在控件库的哪个分组下，默认为 '自定义'） */
  category?: string
  
  /** 默认属性 */
  defaultProps?: Record<string, unknown>
  
  /** 属性配置列表（定义属性面板如何渲染） */
  propertyConfig?: PropertyConfigItem[]
  
  /** 自定义属性编辑组件（可选，用于渲染复杂的属性编辑界面） */
  propertyWidgets?: Record<string, React.ComponentType<PropertyWidgetComponentProps>>

  /**
   * 事件声明（自定义组件支持的事件）
   * - 可选：未声明的 custom:xxx 组件在设计器中不显示任何事件配置项
   * - 读取时使用 config?.events ?? [] 兜底
   */
  events?: EventDeclaration[]

  /** 组件描述 */
  description?: string
  
  /** 是否禁用（不显示在控件库中） */
  disabled?: boolean
}

/**
 * 自定义属性 Widget 组件的 Props
 */
export interface PropertyWidgetComponentProps {
  /** 当前值 */
  value: unknown
  
  /** 值变化回调 */
  onChange: (value: unknown) => void
  
  /** Widget 配置 */
  widgetProps?: PropertyWidgetProps
  
  /** 字段的所有 props（可用于联动） */
  fieldProps?: Record<string, unknown>
  
  /** 字段 Schema（完整） */
  fieldSchema?: Record<string, unknown>
}

/**
 * 自定义组件注册表接口
 */
export interface CustomComponentRegistry {
  /**
   * 注册自定义组件
   * @param config 组件配置
   */
  register(config: CustomComponentConfig): void
  
  /**
   * 批量注册自定义组件
   * @param configs 组件配置数组
   */
  registerMany(configs: CustomComponentConfig[]): void
  
  /**
   * 获取自定义组件配置
   * @param type 组件类型
   */
  get(type: string): CustomComponentConfig | undefined
  
  /**
   * 获取所有已注册的自定义组件
   */
  getAll(): CustomComponentConfig[]
  
  /**
   * 获取按分类分组的自定义组件（用于控件库显示）
   */
  getGrouped(): Record<string, CustomComponentConfig[]>
  
  /**
   * 检查组件是否已注册
   * @param type 组件类型
   */
  has(type: string): boolean
  
  /**
   * 注销自定义组件
   * @param type 组件类型
   */
  unregister(type: string): void
  
  /**
   * 清空注册表
   */
  clear(): void
}

/**
 * 自定义属性 Widget 注册表接口
 */
export interface CustomPropertyWidgetRegistry {
  /**
   * 注册自定义属性 Widget
   * @param name Widget 名称（在 propertyConfig 中引用）
   * @param component Widget 组件
   */
  register(name: string, component: React.ComponentType<PropertyWidgetComponentProps>): void
  
  /**
   * 获取自定义属性 Widget
   * @param name Widget 名称
   */
  get(name: string): React.ComponentType<PropertyWidgetComponentProps> | undefined
  
  /**
   * 检查 Widget 是否已注册
   * @param name Widget 名称
   */
  has(name: string): boolean
  
  /**
   * 注销自定义属性 Widget
   * @param name Widget 名称
   */
  unregister(name: string): void
  
  /**
   * 清空注册表
   */
  clear(): void
}
