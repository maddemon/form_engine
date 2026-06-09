/**
 * Form Engine - 组件注册中心（聚合入口）
 *
 * 从各组件目录的 index.ts 导入 meta 数据，组装成 componentRegistry。
 * 各组件自管 label / category / icon / defaultProps / eventDeclarations。
 *
 * 消费方：
 * - FieldType 联合类型       → keyof typeof componentRegistry | 'custom' | `custom:${string}`
 * - componentPalettes（兼容） → 从 registry 派生
 * - EVENT_DECLARATION_MAP   → 从 registry 派生
 * - PropsRenderMap          → propRenders/index.ts（独立维护，与 registry 保持同步）
 * - paletteData             → 查 registry.label / .defaultProps
 * - getComponentCategory    → 查 registry.category
 */

import React from 'react'
import { ComponentCategory, ComponentRegistration } from '../types/component'
import type { EventDeclaration } from '../types/events'
import type { FieldType, FormFieldSchema } from '../types/schema'
import { meta as alert } from './alert'
import { meta as button } from './button'
import { meta as card } from './card'
import { meta as cascader } from './cascader'
import { meta as checkbox } from './checkbox'
import { meta as collapse } from './collapse'
import { dateMeta, dateRangeMeta } from './date-picker'
import { meta as dateTime } from './date-time'
import { meta as divider } from './divider'
import { meta as flex } from './flex'
import { meta as grid } from './grid'
import iconMap from './icons'
import { meta as image } from './image'
import { inputMeta } from './input'
import { meta as inputNumber } from './input-number'
import { meta as password } from './password'
import { meta as radio } from './radio'
import { meta as rate } from './rate'
import { meta as segment } from './segment'
import { meta as select } from './select'
import { meta as slider } from './slider'
import { meta as subForm } from './sub-form'
import { meta as switch_ } from './switch'
import { meta as tabs } from './tabs'
import { meta as text } from './text'
import { meta as textarea } from './textarea'
import { meta as time } from './time-picker'
import { meta as title_ } from './title'
import { meta as treeSelect } from './tree-select'
import { meta as upload } from './upload'

import type { AlertProps } from './alert/'
import type { ButtonProps } from './button/'
import type { CardProps } from './card/'
import type { CascaderProps } from './cascader/'
import type { CheckboxProps } from './checkbox/'
import type { CollapsePanelConfig, CollapseProps } from './collapse/'
import type { DatePickerProps, DateRangeProps } from './date-picker/'
import type { DividerProps } from './divider/'
import type { FlexProps } from './flex/'
import type { GridProps } from './grid/'
import type { ImageProps } from './image/'
import type { InputNumberProps } from './input-number/'
import type { InputProps } from './input/'
import type { RadioProps } from './radio/'
import type { RateProps } from './rate/'
import type { SegmentProps } from './segment/'
import type { SelectProps } from './select/'
import type { SliderProps } from './slider/'
import type { SubFormColumnConfig, SubFormProps } from './sub-form/'
import type { SwitchProps } from './switch/'
import type { TabPaneConfig, TabsProps } from './tabs/'
import type { TextProps } from './text/'
import type { TextAreaProps } from './textarea/'
import type { TitleProps } from './title/'
import type { TreeSelectProps } from './tree-select/'
import type { UploadFile, UploadProps } from './upload/'
export type {
  AlertProps,
  ButtonProps,
  CardProps,
  CascaderProps,
  CheckboxProps,
  CollapsePanelConfig,
  CollapseProps,
  DatePickerProps,
  DateRangeProps,
  DividerProps,
  FlexProps,
  GridProps,
  ImageProps,
  InputNumberProps,
  InputProps,
  RadioProps,
  RateProps,
  SegmentProps,
  SelectProps,
  SliderProps,
  SubFormColumnConfig,
  SubFormProps,
  SwitchProps,
  TabPaneConfig,
  TabsProps,
  TextAreaProps,
  TextProps,
  TitleProps,
  TreeSelectProps,
  UploadFile,
  UploadProps
}

// ============================
// 事件声明 re-export（保持兼容）
// ============================

export { alertEventDeclarations } from './alert'
export { buttonEventDeclarations } from './button'
export { cascaderEventDeclarations } from './cascader'
export { checkboxEventDeclarations } from './checkbox'
export { datePickerEventDeclarations, dateRangeEventDeclarations } from './date-picker'
export { inputEventDeclarations } from './input'
export { inputNumberEventDeclarations } from './input-number'
export { radioEventDeclarations } from './radio'
export { rateEventDeclarations } from './rate'
export { segmentEventDeclarations } from './segment'
export { selectEventDeclarations } from './select'
export { sliderEventDeclarations } from './slider'
export { switchEventDeclarations } from './switch'
export { textAreaEventDeclarations } from './textarea'
export { treeSelectEventDeclarations } from './tree-select'
export { uploadEventDeclarations } from './upload'

// ============================
// 组件注册表（数据源自各组件 index.ts）
// ============================

export const componentRegistry = {
  // ── 表单组件 ─────────────────────────────────────
  input: { ...inputMeta },
  textarea: { ...textarea },
  'input-number': { ...inputNumber },
  password: { ...password },
  select: { ...select },
  'multi-select': { ...select },
  radio: { ...radio },
  checkbox: { ...checkbox },
  switch: { ...switch_ },
  slider: { ...slider },
  rate: { ...rate },
  date: { ...dateMeta },
  'date-range': { ...dateRangeMeta },
  datetime: { ...dateTime },
  time: { ...time },
  upload: { ...upload },
  cascader: { ...cascader },
  'tree-select': { ...treeSelect },

  // ── 容器组件 ─────────────────────────────────────
  grid: { ...grid },
  flex: { ...flex },
  collapse: { ...collapse },
  tabs: { ...tabs },
  'sub-form': { ...subForm },
  card: { ...card },

  // ── 展示组件 ─────────────────────────────────────
  text: { ...text },
  title: { ...title_ },
  image: { ...image },
  divider: { ...divider },
  alert: { ...alert },
  segment: { ...segment },

  // ── 按钮组件 ─────────────────────────────────────
  button: { ...button },
} as const satisfies Record<string, ComponentRegistration>

// ============================
// 从 registry 派生的查询表
// ============================

/**
 * EVENT_DECLARATION_MAP（从 registry 派生）
 */
const EVENT_DECLARATION_MAP: Record<string, EventDeclaration[]> = Object.fromEntries(
  Object.entries(componentRegistry).map(([type, reg]) => [type, reg.eventDeclarations]),
)

/** 按 FieldType 查询该组件支持的事件声明 */
export function getEventDeclarations(type: string): EventDeclaration[] {
  return EVENT_DECLARATION_MAP[type] ?? []
}

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

/** 所有内置字段类型列表 */
export const ALL_FIELD_TYPES = Object.keys(componentRegistry)

// ============================
// 图标（保持兼容）
// ============================

export { iconMap }
