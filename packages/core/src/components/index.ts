/**
 * Form Engine - Core Components
 * 仅导出组件类型定义和属性配置
 * 实际组件实现由 adapter 提供
 */

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
export type { ContainerProps } from './container/types'
export type { GridProps, GridRowConfig, GridColConfig } from './grid/types'
export type { FlexProps } from './flex/types'

// ============================
// 图标（保留，与设计器相关）
// ============================

export { default as iconMap } from './icons'
