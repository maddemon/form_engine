/**
 * Form Engine - 组件查询工具函数
 *
 * 从 componentRegistry 派生的查询函数，供设计器和渲染器使用。
 */

import React from 'react'
import type { ComponentCategory, ComponentRegistration } from '../types/component'
import type { FieldType, FormFieldSchema } from '../types/schema'
import { componentRegistry } from './registry'
import iconMap from './icons'

// ============================
// Registry 查询工具函数
// ============================

/** 获取组件显示名称 */
export function getComponentLabel(type: string, t?: (key: string) => string | undefined): string | undefined {
  const reg = (componentRegistry as Record<string, ComponentRegistration>)[type]
  if (!reg) return type
  if (type === 'custom' || type.startsWith('custom:')) return reg.label
  return t ? t(reg.label) : reg.label
}

/** 获取组件分类（支持 custom / custom:xxx） */
export function getComponentCategory(type: string): ComponentCategory | ComponentCategory[] | null {
  if (type.startsWith('custom:')) return 'form'
  if (type === 'custom') return 'form'
  return (componentRegistry as Record<string, ComponentRegistration>)[type]?.category ?? null
}

/** 判断组件是否属于指定分类 */
function hasCategory(type: string, cat: ComponentCategory): boolean {
  const c = getComponentCategory(type)
  if (!c) return false
  if (Array.isArray(c)) return c.includes(cat)
  return c === cat
}

export function isFormComponent(type: string): boolean {
  return hasCategory(type, 'form')
}

export function isDisplayComponent(type: string): boolean {
  return hasCategory(type, 'display')
}

export function isContainerComponent(type: string): boolean {
  return hasCategory(type, 'container')
}

export function isButtonComponent(type: string): boolean {
  return hasCategory(type, 'button')
}

/** 获取组件图标名称（字符串） */
export function getComponentIconName(type: string): string | null {
  return (componentRegistry as Record<string, ComponentRegistration>)[type]?.icon ?? null
}

/** 获取组件图标 ReactNode（兼容旧接口） */
export function getComponentIcon(type: string): React.ReactNode | null {
  const name = getComponentIconName(type)
  if (!name) return null
  const Icon = (iconMap as Record<string, React.FC<{ size?: number; color?: string; strokeWidth?: number }>>)[name]
  return Icon ? React.createElement(Icon) : null
}

/** 获取组件默认 Schema */
export function getComponentDefaultProps(type: string): Partial<FormFieldSchema> {
  const props = (componentRegistry as Record<string, ComponentRegistration>)[type]?.defaultProps
  if (typeof props === 'function') return props()
  return props ?? {}
}

/** 获取所有表单组件类型 */
export function getFormFieldTypes(): FieldType[] {
  return Object.entries(componentRegistry)
    .filter(([type]) => hasCategory(type, 'form'))
    .map(([type]) => type) as FieldType[]
}

/** 获取所有容器组件类型 */
export function getContainerFieldTypes(): FieldType[] {
  return Object.entries(componentRegistry)
    .filter(([type]) => hasCategory(type, 'container'))
    .map(([type]) => type) as FieldType[]
}