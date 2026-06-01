/**
 * 自定义组件简化注册 API
 * 
 * 提供简单的注册方式，自动推断属性配置
 */

import React from 'react'
import type {
  CustomComponentConfig,
  PropertyConfigItem,
  PropertyWidgetType,
} from '../types/custom-component'
import { customComponentRegistry } from './customComponentRegistry'
import { registerComponent } from './componentRegistry'

/**
 * 简化注册选项
 * 只需要提供最基本的配置，其余自动推断
 */
export interface SimpleCustomComponentOptions {
  /** 显示名称 */
  label: string
  
  /** 图标（可选） */
  icon?: React.ReactNode | string
  
  /** 分类（默认为 '自定义'） */
  category?: string
  
  /** 默认属性 */
  defaultProps?: Record<string, unknown>
  
  /** 
   * 属性配置（可选）
   * 如果不提供，会根据 defaultProps 自动推断
   */
  propertyConfig?: PropertyConfigItem[]
  
  /** 组件描述 */
  description?: string
}

/**
 * 根据值类型推断 widget 类型
 */
function inferWidgetType(value: unknown): PropertyWidgetType {
  if (typeof value === 'string') {
    // 长文本可能是 textarea
    if (value.length > 50) return 'textarea'
    return 'input'
  }
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'checkbox'
  if (Array.isArray(value)) return 'json'
  if (typeof value === 'object' && value !== null) return 'json'
  return 'input'
}

/**
 * 根据 defaultProps 自动生成 propertyConfig
 */
function generatePropertyConfig(defaultProps: Record<string, unknown>): PropertyConfigItem[] {
  const config: PropertyConfigItem[] = []
  
  for (const [key, value] of Object.entries(defaultProps)) {
    // 跳过内部属性（以下划线开头）
    if (key.startsWith('_')) continue
    
    config.push({
      key,
      label: key, // 默认使用 key 作为标签，用户可以后续自定义
      widget: inferWidgetType(value),
      group: '基础',
    })
  }
  
  return config
}

/**
 * 简化注册自定义组件
 * 
 * 示例：
 * ```typescript
 * // 方式 1：自动推断（最简单）
 * registerSimpleCustomComponent('my-button', MyButton, {
 *   label: '我的按钮',
 *   defaultProps: {
 *     text: '按钮文字',
 *     size: 'medium',
 *     disabled: false,
 *   }
 * })
 * 
 * // 方式 2：手动指定 propertyConfig（更精确）
 * registerSimpleCustomComponent('my-button', MyButton, {
 *   label: '我的按钮',
 *   defaultProps: { text: '按钮', size: 'medium' },
 *   propertyConfig: [
 *     { key: 'text', label: '按钮文字', widget: 'input' },
 *     { key: 'size', label: '尺寸', widget: 'select', 
 *       widgetProps: { options: [{ label: '小', value: 'small' }, ...] } 
 *     },
 *   ]
 * })
 * ```
 * 
 * @param type 组件类型标识（唯一）
 * @param component 组件实例
 * @param options 配置选项
 */
export function registerSimpleCustomComponent(
  type: `custom:${string}`,
  component: React.ComponentType<any>,
  options: SimpleCustomComponentOptions
): void {
  // 自动生成 propertyConfig（如果未提供）
  const propertyConfig = options.propertyConfig || 
    (options.defaultProps ? generatePropertyConfig(options.defaultProps) : [])
  
  const config: CustomComponentConfig = {
    type,
    label: options.label,
    icon: options.icon,
    category: options.category || '自定义',
    defaultProps: options.defaultProps,
    propertyConfig,
    description: options.description,
  }
  
  // 注册到自定义组件注册表
  customComponentRegistry.register(config)
  
  // 同时注册组件到组件注册表（使其可在画布中渲染）
  registerComponent(type, component)
}

/**
 * 完整注册自定义组件（需要显式定义 propertyConfig）
 * 
 * 示例：
 * ```typescript
 * registerCustomComponent('color-picker', ColorPicker, {
 *   label: '颜色选择器',
 *   category: '高级',
 *   defaultProps: { color: '#000000' },
 *   propertyConfig: [
 *     { key: 'color', label: '颜色', widget: 'custom', 
 *       widgetProps: { customWidget: 'ColorPicker' } 
 *     }
 *   ],
 *   propertyWidgets: {
 *     ColorPicker: ColorPickerWidget
 *   }
 * })
 * ```
 */
export function registerCustomComponent(
  type: `custom:${string}`,
  component: React.ComponentType<any>,
  config: CustomComponentConfig
): void {
  customComponentRegistry.register(config)
  
  // 同时注册组件到组件注册表（使其可在画布中渲染）
  registerComponent(type, component)
}

/**
 * 注销自定义组件
 */
export function unregisterCustomComponent(type: `custom:${string}`): void {
  customComponentRegistry.unregister(type)
}
