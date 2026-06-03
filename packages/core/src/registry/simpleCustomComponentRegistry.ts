/**
 * 自定义组件简化注册 API
 * 
 * 提供简单的注册方式，自动推断属性配置
 * 
 * 注意：自定义组件的渲染需要通过 FormRender/Designer 的 components prop 传入，
 * 或注册到 adapter.components 中。此模块只管理设计器属性面板的配置。
 */

import React from 'react'
import type {
  CustomComponentConfig,
  PropertyConfigItem,
  PropertyWidgetType,
} from '../types/custom-component'
import { customComponentRegistry } from './customComponentRegistry'

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
    if (key.startsWith('_')) continue
    
    config.push({
      key,
      label: key,
      widget: inferWidgetType(value),
      group: '基础',
    })
  }
  
  return config
}

/**
 * 简化注册自定义组件
 * 
 * 注册后，自定义组件会出现在设计器调色板和属性面板中。
 * 组件渲染需要通过 components prop 传入到 FormRender/Designer。
 * 
 * @param type 组件类型标识（唯一）
 * @param _component 组件实例（保留参数，用于向后兼容）
 * @param options 配置选项
 */
export function registerSimpleCustomComponent(
  type: `custom:${string}`,
  _component: React.ComponentType<any>,
  options: SimpleCustomComponentOptions
): void {
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
  
  // 注册到自定义组件注册表（设计器属性面板使用）
  customComponentRegistry.register(config)
}

/**
 * 完整注册自定义组件（需要显式定义 propertyConfig）
 */
export function registerCustomComponent(
  type: `custom:${string}`,
  _component: React.ComponentType<any>,
  config: CustomComponentConfig
): void {
  customComponentRegistry.register(config)
}

/**
 * 注销自定义组件
 */
export function unregisterCustomComponent(type: `custom:${string}`): void {
  customComponentRegistry.unregister(type)
}
