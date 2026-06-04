/**
 * Form Engine - Core Components
 * 仅导出组件类型定义和属性配置
 * 实际组件实现由 adapter 提供
 */

import type { EventDeclaration } from '../types/events'

// ============================
// 事件声明导入（供设计器查询 & 映射表填充）
// ============================

import { inputEventDeclarations } from './input/types'
import { textAreaEventDeclarations } from './textarea/types'
import { inputNumberEventDeclarations } from './input-number/types'
import { selectEventDeclarations } from './select/types'
import { radioEventDeclarations } from './radio/types'
import { checkboxEventDeclarations } from './checkbox/types'
import { switchEventDeclarations } from './switch/types'
import { sliderEventDeclarations } from './slider/types'
import { rateEventDeclarations } from './rate/types'
import { datePickerEventDeclarations, dateRangeEventDeclarations } from './date-picker/types'
import { uploadEventDeclarations } from './upload/types'
import { buttonEventDeclarations } from './button/types'
import { cascaderEventDeclarations } from './cascader/types'
import { treeSelectEventDeclarations } from './tree-select/types'
import { alertEventDeclarations } from './alert/types'
import { segmentEventDeclarations } from './segment/types'

// ============================
// 类型导出
// ============================

export type { InputProps } from './input/types'
export type { TextAreaProps } from './textarea/types'
export type { InputNumberProps } from './input-number/types'
export type { SelectProps } from './select/types'
export type { RadioProps } from './radio/types'
export type { CheckboxProps } from './checkbox/types'
export type { SwitchProps } from './switch/types'
export type { SliderProps } from './slider/types'
export type { RateProps } from './rate/types'
export type { DatePickerProps, DateRangeProps } from './date-picker/types'
export type { UploadProps, UploadFile } from './upload/types'
export type { ButtonProps } from './button/types'
export type { TextProps } from './text/types'
export type { ImageProps } from './image/types'
export type { DividerProps } from './divider/types'
export type { GridProps } from './grid/types'
export type { FlexProps } from './flex/types'
export type { CascaderProps } from './cascader/types'
export type { TreeSelectProps } from './tree-select/types'
export type { CardProps } from './card/types'
export type { AlertProps } from './alert/types'
export type { SegmentProps } from './segment/types'

// ============================
// 事件声明 re-export
// ============================

export {
  inputEventDeclarations,
  textAreaEventDeclarations,
  inputNumberEventDeclarations,
  selectEventDeclarations,
  radioEventDeclarations,
  checkboxEventDeclarations,
  switchEventDeclarations,
  sliderEventDeclarations,
  rateEventDeclarations,
  datePickerEventDeclarations,
  dateRangeEventDeclarations,
  uploadEventDeclarations,
  buttonEventDeclarations,
  cascaderEventDeclarations,
  treeSelectEventDeclarations,
  alertEventDeclarations,
  segmentEventDeclarations,
}

// ============================
// 事件声明查询表
// ============================

/**
 * FieldType → EventDeclaration[] 映射
 * 内部组件按 FieldType（小写连字符）索引
 */
const EVENT_DECLARATION_MAP: Record<string, EventDeclaration[]> = {
  input: inputEventDeclarations,
  password: inputEventDeclarations,
  textarea: textAreaEventDeclarations,
  'input-number': inputNumberEventDeclarations,
  select: selectEventDeclarations,
  'multi-select': selectEventDeclarations,
  radio: radioEventDeclarations,
  checkbox: checkboxEventDeclarations,
  switch: switchEventDeclarations,
  slider: sliderEventDeclarations,
  rate: rateEventDeclarations,
  date: datePickerEventDeclarations,
  'date-range': dateRangeEventDeclarations,
  'date-time': datePickerEventDeclarations,
  'time-picker': datePickerEventDeclarations,
  upload: uploadEventDeclarations,
  button: buttonEventDeclarations,
  cascader: cascaderEventDeclarations,
  'tree-select': treeSelectEventDeclarations,
  alert: alertEventDeclarations,
  segment: segmentEventDeclarations,
}

/**
 * 按 FieldType 查询该组件支持的事件声明
 * - 内置组件：返回对应 xxxEventDeclarations
 * - 自定义组件（custom:xxx）：返回空数组，请改用 customComponentRegistry.get(type).events
 * - 未知类型：返回空数组
 */
export function getEventDeclarations(type: string): EventDeclaration[] {
  return EVENT_DECLARATION_MAP[type] ?? []
}

// ============================
// 图标（保留，与设计器相关）
// ============================

export { default as iconMap } from './icons'
