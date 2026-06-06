/**
 * Property Slot 类型定义
 *
 * Slot = 一个命名属性编辑器的占位。核心只提供兜底（textarea/input），
 * Adapter 或使用者可以注册更好的实现。
 */

import type * as React from 'react'
import type { FormFieldSchema } from './schema'

/**
 * Slot 名称枚举
 */
export type SlotName = 'expressionEditor' | 'dataSourceEditor' | 'jsonEditor' | 'codeEditor'

/**
 * Slot 组件的 Props
 */
export interface PropertySlotProps {
  /** 当前值 */
  value: unknown
  /** 值变化回调 */
  onChange: (value: unknown) => void
  /** 当前正在编辑的字段 Schema（可为 null，如 FormConfig 场景） */
  field?: FormFieldSchema | null
  /** 所有字段名（用于表达式编辑器插入字段名） */
  fieldNames?: string[]
  /** Slot 专属上下文 */
  context?: Record<string, unknown>
  /** 占位提示文本 */
  placeholder?: string
}

/**
 * Slot 注册表（运行时注入）
 */
export interface PropertySlots {
  expressionEditor?: React.ComponentType<PropertySlotProps>
  dataSourceEditor?: React.ComponentType<PropertySlotProps>
  jsonEditor?: React.ComponentType<PropertySlotProps>
  codeEditor?: React.ComponentType<PropertySlotProps>
}
