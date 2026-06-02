/**
 * 组件 Props 类型统一导出
 * 各组件的具体 Props 定义已迁移至各组件文件夹内的 types.ts
 * 此处集中导出，并保留 ComponentPropsMap 等映射类型
 *
 * 命名参考 antd、material-ui 等知名库
 */

// ============================
// 从各组件文件夹导入具体 Props 类型（本地使用）
// ============================

import type { InputProps } from '../components/input/types'
import type { TextAreaProps } from '../components/textarea/types'
import type { InputNumberProps } from '../components/input-number/types'
import type { SelectProps } from '../components/select/types'
import type { RadioProps } from '../components/radio/types'
import type { CheckboxProps } from '../components/checkbox/types'
import type { SwitchProps } from '../components/switch/types'
import type { SliderProps } from '../components/slider/types'
import type { RateProps } from '../components/rate/types'
import type { DatePickerProps, DateRangeProps } from '../components/date-picker/types'
import type { UploadProps, UploadFile } from '../components/upload/types'
import type { ButtonProps } from '../components/button/types'
import type { TextProps } from '../components/text/types'
import type { ImageProps } from '../components/image/types'
import type { DividerProps } from '../components/divider/types'
import type { TitleProps } from '../components/title/types'
import type { ContainerProps } from '../components/container/types'
import type { GridProps, GridRowConfig, GridColConfig } from '../components/grid/types'
import type { FlexProps } from '../components/flex/types'
import type { CollapseProps } from '../components/collapse/types'
import type { TabsProps } from '../components/tabs/types'
import type { TableProps } from '../components/table/types'
import type { CascaderProps } from '../components/cascader/types'
import type { TreeSelectProps } from '../components/tree-select/types'

// ============================
// 导出类型（供其他模块使用）
// ============================

export type {
  InputProps,
  TextAreaProps,
  InputNumberProps,
  SelectProps,
  RadioProps,
  CheckboxProps,
  SwitchProps,
  SliderProps,
  RateProps,
  DatePickerProps,
  DateRangeProps,
  UploadProps,
  UploadFile,
  ButtonProps,
  TextProps,
  ImageProps,
  DividerProps,
  TitleProps,
  ContainerProps,
  GridProps,
  GridRowConfig,
  GridColConfig,
  FlexProps,
  CollapseProps,
  TabsProps,
  TableProps,
  CascaderProps,
  TreeSelectProps,
}

// ============================
// 尚未实现组件的 Props（保留原有定义）
// ============================

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
// 基类 Props（从 base-props.ts 导入并导出）
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
  'TextArea': TextAreaProps
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
  'Title': TitleProps
  'Container': ContainerProps
  'Grid': GridProps
  'Flex': FlexProps
  'Collapse': CollapseProps
  'Tabs': TabsProps
  'Table': TableProps
  'Button': ButtonProps
}

/** 根据组件类型获取 Props 类型 */
export type ComponentProps<T extends keyof ComponentPropsMap> = ComponentPropsMap[T]

/** 组件类型 */
export type ComponentType = keyof ComponentPropsMap
