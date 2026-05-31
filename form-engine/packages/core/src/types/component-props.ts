/**
 * 组件 Props 类型统一导出
 * 各组件的具体 Props 定义已迁移至各组件文件夹内的 types.ts
 * 此处集中导出，并保留 ComponentPropsMap 等映射类型
 *
 * 命名参考 antd、material-ui 等知名库
 */

// ============================
// 从各组件文件夹导入具体 Props 类型
// ============================

export type { InputProps } from '../components/input/types'
export type { TextAreaProps } from '../components/textarea/types'
export type { InputNumberProps } from '../components/input-number/types'
export type { SelectProps } from '../components/select/types'
export type { RadioProps } from '../components/radio/types'
export type { CheckboxProps } from '../components/checkbox/types'
export type { SwitchProps } from '../components/switch/types'
export type { SliderProps } from '../components/slider/types'
export type { RateProps } from '../components/rate/types'
export type { DatePickerProps, DateRangeProps } from '../components/date-picker/types'
export type { UploadProps, UploadFile } from '../components/upload/types'
export type { ButtonProps } from '../components/button/types'
export type { TextProps } from '../components/text/types'
export type { ImageProps } from '../components/image/types'
export type { DividerProps } from '../components/divider/types'
export type { ContainerProps } from '../components/container/types'
export type { GridProps } from '../components/grid/types'
export type { FlexProps } from '../components/flex/types'

// 尚未实现组件的 Props（保留原有定义）
export interface CascaderProps {
  value?: string[]
  onChange?: (value: string[]) => void
  options?: import('./schema').OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  expandTrigger?: 'click' | 'hover'
}

export interface TreeSelectProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  options?: import('./schema').OptionItem[]
  placeholder?: string
  allowClear?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  showSearch?: boolean
}

export interface TimePickerProps {
  value?: string | null
  onChange?: (value: string | null) => void
  format?: string
  minuteStep?: number
  secondStep?: number
  disabledTime?: (selectedTime: string) => { disabledHours: () => number[]; disabledMinutes: () => number[]; disabledSeconds: () => number[] }
  placeholder?: string
  allowClear?: boolean
}

// ============================
// 基类 Props（从 base-props.ts 导入）
// ============================

export type {
  BaseComponentProps,
  BaseFormComponentProps,
  BaseLayoutComponentProps,
} from './base-props'

// ============================
// 组件 Props 映射
// ============================

/** 组件类型 -> Props 的映射 */
export interface ComponentPropsMap {
  'Input': InputProps
  'InputNumber': InputNumberProps
  'Textarea': TextAreaProps
  'Password': InputProps  // Password 复用 InputProps
  'Select': SelectProps
  'MultiSelect': SelectProps  // MultiSelect 复用 SelectProps
  'Radio': RadioProps
  'Checkbox': CheckboxProps
  'Switch': SwitchProps
  'Slider': SliderProps
  'Rate': RateProps
  'DatePicker': DatePickerProps
  'DateRange': DateRangeProps
  'TimePicker': TimePickerProps
  'Upload': UploadProps
  'Cascader': CascaderProps
  'TreeSelect': TreeSelectProps
  'Text': TextProps
  'Image': ImageProps
  'Divider': DividerProps
  'Title': { level?: 1 | 2 | 3 | 4 | 5; content?: string }
  'Container': ContainerProps
  'Grid': GridProps
  'Flex': FlexProps
}

/** 根据组件类型获取 Props 类型 */
export type ComponentProps<T extends keyof ComponentPropsMap> = ComponentPropsMap[T]

/** 组件类型 */
export type ComponentType = keyof ComponentPropsMap
