/**
 * Form Engine - 组件注册中心（Single Source of Truth）
 *
 * 所有内置组件的元信息（label / category / icon / defaultProps / eventDeclarations）
 * 统一在此注册。新增组件只需在此文件添加一条记录。
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
import type { ComponentCategory } from '../types/component-category'
import type { EventDeclaration } from '../types/events'
import type { FormFieldSchema } from '../types/schema'
import iconMap from './icons'

// ============================
// ComponentRegistration 接口
// ============================

export interface ComponentRegistration {
  /** 显示名称 */
  label: string
  /** 组件分类（form / display / container / button） */
  category: ComponentCategory
  /** 图标名称（纯字符串，通过 icons/iconMap 查找实际 SVG 组件） */
  icon: string
  /** 拖入画布时的默认 Schema（合并到 field） */
  defaultProps?: Partial<FormFieldSchema>
  /** 该组件支持的事件声明 */
  eventDeclarations: EventDeclaration[]
}

// ============================
// 事件声明导入
// ============================

import { alertEventDeclarations } from './alert/types'
import { buttonEventDeclarations } from './button/types'
import { cascaderEventDeclarations } from './cascader/types'
import { checkboxEventDeclarations } from './checkbox/types'
import { datePickerEventDeclarations, dateRangeEventDeclarations } from './date-picker/types'
import { inputNumberEventDeclarations } from './input-number/types'
import { inputEventDeclarations } from './input/types'
import { radioEventDeclarations } from './radio/types'
import { rateEventDeclarations } from './rate/types'
import { segmentEventDeclarations } from './segment/types'
import { selectEventDeclarations } from './select/types'
import { sliderEventDeclarations } from './slider/types'
import { switchEventDeclarations } from './switch/types'
import { textAreaEventDeclarations } from './textarea/types'
import { treeSelectEventDeclarations } from './tree-select/types'
import { uploadEventDeclarations } from './upload/types'

// ============================
// 类型导出（保持兼容）
// ============================

export type { AlertProps } from './alert/types'
export type { ButtonProps } from './button/types'
export type { CardProps } from './card/types'
export type { CascaderProps } from './cascader/types'
export type { CheckboxProps } from './checkbox/types'
export type { DatePickerProps, DateRangeProps } from './date-picker/types'
export type { DividerProps } from './divider/types'
export type { FlexProps } from './flex/types'
export type { GridProps } from './grid/types'
export type { ImageProps } from './image/types'
export type { InputNumberProps } from './input-number/types'
export type { InputProps } from './input/types'
export type { RadioProps } from './radio/types'
export type { RateProps } from './rate/types'
export type { SegmentProps } from './segment/types'
export type { SelectProps } from './select/types'
export type { SliderProps } from './slider/types'
export type { SwitchProps } from './switch/types'
export type { TextProps } from './text/types'
export type { TextAreaProps } from './textarea/types'
export type { TreeSelectProps } from './tree-select/types'
export type { UploadFile, UploadProps } from './upload/types'

// ============================
// 事件声明 re-export（保持兼容）
// ============================

export {
  alertEventDeclarations, buttonEventDeclarations,
  cascaderEventDeclarations, checkboxEventDeclarations, datePickerEventDeclarations,
  dateRangeEventDeclarations, inputEventDeclarations, inputNumberEventDeclarations, radioEventDeclarations, rateEventDeclarations, segmentEventDeclarations, selectEventDeclarations, sliderEventDeclarations, switchEventDeclarations, textAreaEventDeclarations, treeSelectEventDeclarations, uploadEventDeclarations
}

// ============================
// 默认选项（部分组件需要）
// ============================

const DEFAULT_OPTIONS_3 = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

const DEFAULT_CASCADER_OPTIONS = [
  {
    label: '选项一',
    value: 'option1',
    children: [
      { label: '子选项1-1', value: 'option1-1' },
      { label: '子选项1-2', value: 'option1-2' },
    ],
  },
  {
    label: '选项二',
    value: 'option2',
    children: [{ label: '子选项2-1', value: 'option2-1' }],
  },
  { label: '选项三', value: 'option3' },
]

// ============================
// 组件注册表（Single Source of Truth）
// ============================

export const componentRegistry = {
  // ── 表单组件 ─────────────────────────────────────
  input: {
    label: '单行文本',
    category: 'form',
    icon: 'Type',
    eventDeclarations: inputEventDeclarations,
  },
  textarea: {
    label: '多行文本',
    category: 'form',
    icon: 'FileText',
    eventDeclarations: textAreaEventDeclarations,
  },
  'input-number': {
    label: '数字',
    category: 'form',
    icon: 'Hash',
    eventDeclarations: inputNumberEventDeclarations,
  },
  password: {
    label: '密码',
    category: 'form',
    icon: 'Lock',
    eventDeclarations: inputEventDeclarations,
  },
  select: {
    label: '下拉框',
    category: 'form',
    icon: 'ChevronDown',
    defaultProps: { componentProps: { options: DEFAULT_OPTIONS_3 } },
    eventDeclarations: selectEventDeclarations,
  },
  'multi-select': {
    label: '下拉框',
    category: 'form',
    icon: 'ChevronDown',
    defaultProps: { componentProps: { options: DEFAULT_OPTIONS_3 } },
    eventDeclarations: selectEventDeclarations,
  },
  radio: {
    label: '单选框',
    category: 'form',
    icon: 'Circle',
    defaultProps: { componentProps: { options: DEFAULT_OPTIONS_3 } },
    eventDeclarations: radioEventDeclarations,
  },
  checkbox: {
    label: '多选框',
    category: 'form',
    icon: 'CheckSquare',
    defaultProps: { componentProps: { options: DEFAULT_OPTIONS_3 } },
    eventDeclarations: checkboxEventDeclarations,
  },
  switch: {
    label: '开关',
    category: 'form',
    icon: 'ToggleLeft',
    defaultProps: { defaultValue: false },
    eventDeclarations: switchEventDeclarations,
  },
  slider: {
    label: '滑块',
    category: 'form',
    icon: 'Slash',
    defaultProps: { componentProps: { min: 0, max: 100, step: 1 } },
    eventDeclarations: sliderEventDeclarations,
  },
  rate: {
    label: '评分',
    category: 'form',
    icon: 'Star',
    defaultProps: { componentProps: { count: 5 } },
    eventDeclarations: rateEventDeclarations,
  },
  date: {
    label: '日期',
    category: 'form',
    icon: 'Calendar',
    defaultProps: { componentProps: { format: 'YYYY-MM-DD' } },
    eventDeclarations: datePickerEventDeclarations,
  },
  'date-range': {
    label: '日期范围',
    category: 'form',
    icon: 'Calendar',
    defaultProps: { componentProps: { format: 'YYYY-MM-DD' } },
    eventDeclarations: dateRangeEventDeclarations,
  },
  datetime: {
    label: '日期时间',
    category: 'form',
    icon: 'Calendar',
    defaultProps: { componentProps: { format: 'YYYY-MM-DD HH:mm', showTime: true } },
    eventDeclarations: datePickerEventDeclarations,
  },
  time: {
    label: '时间',
    category: 'form',
    icon: 'Clock',
    defaultProps: { componentProps: { format: 'HH:mm' } },
    eventDeclarations: datePickerEventDeclarations,
  },
  upload: {
    label: '上传',
    category: 'form',
    icon: 'Upload',
    eventDeclarations: uploadEventDeclarations,
  },
  cascader: {
    label: '级联选择',
    category: 'form',
    icon: 'GitBranch',
    defaultProps: { componentProps: { options: DEFAULT_CASCADER_OPTIONS } },
    eventDeclarations: cascaderEventDeclarations,
  },
  'tree-select': {
    label: '树选择',
    category: 'form',
    icon: 'FolderOpen',
    defaultProps: { componentProps: { options: DEFAULT_CASCADER_OPTIONS } },
    eventDeclarations: treeSelectEventDeclarations,
  },

  // ── 容器组件 ─────────────────────────────────────
  grid: {
    label: '栅格布局',
    category: 'container',
    icon: 'Grid',
    defaultProps: {
      componentProps: {
        colSpans: [
          { id: 'col_1', span: 12 },
          { id: 'col_2', span: 12 },
        ],
        gap: 16,
      },
    },
    eventDeclarations: [],
  },
  flex: {
    label: '弹性布局',
    category: 'container',
    icon: 'Layout',
    defaultProps: { componentProps: { direction: 'row', gap: 16 } },
    eventDeclarations: [],
  },
  collapse: {
    label: '折叠面板',
    category: 'container',
    icon: 'FolderOpen',
    defaultProps: {
      componentProps: {
        panels: [
          { id: 'panel_1', key: 'panel_1', header: '面板一' },
          { id: 'panel_2', key: 'panel_2', header: '面板二' },
        ],
        accordion: false,
        ghost: false,
      },
    },
    eventDeclarations: [],
  },
  tabs: {
    label: '标签页',
    category: 'container',
    icon: 'Minus',
    defaultProps: {
      componentProps: {
        tabs: [
          { id: 'tab_1', key: 'tab_1', title: '标签页一' },
          { id: 'tab_2', key: 'tab_2', title: '标签页二' },
        ],
      },
    },
    eventDeclarations: [],
  },
  table: {
    label: '子表单',
    category: 'container',
    icon: 'Table',
    defaultProps: {
      componentProps: {
        columns: [
          { id: 'col_1', label: '列1', width: 120 },
          { id: 'col_2', label: '列2', width: 120 },
        ],
        rowMode: 'dynamic',
      },
    },
    eventDeclarations: [],
  },
  card: {
    label: '卡片',
    category: 'container',
    icon: 'Layout',
    defaultProps: {
      componentProps: {
        title: '卡片标题',
        bodyPadding: 16,
        bodyGap: 8,
        bordered: true,
        size: 'default',
      },
    },
    eventDeclarations: [],
  },

  // ── 展示组件 ─────────────────────────────────────
  text: {
    label: '文本展示',
    category: 'display',
    icon: 'Type',
    defaultProps: { componentProps: { content: '文本内容' } },
    eventDeclarations: [],
  },
  title: {
    label: '标题',
    category: 'display',
    icon: 'Type',
    defaultProps: { componentProps: { level: 1, content: '标题内容' } },
    eventDeclarations: [],
  },
  image: {
    label: '图片展示',
    category: 'display',
    icon: 'Image',
    defaultProps: { componentProps: { alt: '图片描述', src: '' } },
    eventDeclarations: [],
  },
  divider: {
    label: '分割线',
    category: 'display',
    icon: 'Minus',
    eventDeclarations: [],
  },
  alert: {
    label: '警告提示',
    category: 'display',
    icon: 'Circle',
    defaultProps: {
      componentProps: { type: 'info', content: '提示内容', showIcon: true, closable: false },
    },
    eventDeclarations: alertEventDeclarations,
  },
  segment: {
    label: '分段控制器',
    category: 'display',
    icon: 'ToggleLeft',
    defaultProps: {
      componentProps: {
        options: [
          { label: '选项1', value: 'option_1' },
          { label: '选项2', value: 'option_2' },
          { label: '选项3', value: 'option_3' },
        ],
        size: 'middle',
        block: false,
      },
    },
    eventDeclarations: segmentEventDeclarations,
  },

  // ── 按钮组件 ─────────────────────────────────────
  button: {
    label: '按钮',
    category: 'button',
    icon: 'Square',
    defaultProps: { componentProps: { children: '按钮' } },
    eventDeclarations: buttonEventDeclarations,
  },
} as const satisfies Record<string, ComponentRegistration>

// ============================
// 从 registry 派生的查询表
// ============================

/**
 * EVENT_DECLARATION_MAP（从 registry 派生）
 */
const EVENT_DECLARATION_MAP: Record<string, EventDeclaration[]> = Object.fromEntries(Object.entries(componentRegistry).map(([type, reg]) => [type, reg.eventDeclarations]))

/** 按 FieldType 查询该组件支持的事件声明 */
export function getEventDeclarations(type: string): EventDeclaration[] {
  return EVENT_DECLARATION_MAP[type] ?? []
}

// ============================
// Registry 查询工具函数
// ============================

/** 获取组件显示名称 */
export function getComponentLabel(type: string): string {
  return (componentRegistry as Record<string, ComponentRegistration>)[type]?.label ?? type
}

/** 获取组件分类（支持 custom / custom:xxx） */
export function getComponentCategory(type: string): ComponentCategory | null {
  if (type.startsWith('custom:')) return 'form'
  if (type === 'custom') return 'form'
  return (componentRegistry as Record<string, ComponentRegistration>)[type]?.category ?? null
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
  return (componentRegistry as Record<string, ComponentRegistration>)[type]?.defaultProps ?? {}
}

/** 获取所有表单组件类型 */
export function getFormFieldTypes(): string[] {
  return Object.entries(componentRegistry)
    .filter(([_, reg]) => reg.category === 'form')
    .map(([type]) => type)
}

/** 获取所有容器组件类型 */
export function getContainerFieldTypes(): string[] {
  return Object.entries(componentRegistry)
    .filter(([_, reg]) => reg.category === 'container')
    .map(([type]) => type)
}

/** 所有内置字段类型列表 */
export const ALL_FIELD_TYPES = Object.keys(componentRegistry)

// ============================
// 图标（保持兼容）
// ============================

export { iconMap }
