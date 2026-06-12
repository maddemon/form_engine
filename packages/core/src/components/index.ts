/**
 * Form Engine - 组件注册中心（聚合入口）
 *
 * 仅保留 re-export。注册表和查询函数已拆分到：
 * - registry.ts  → componentRegistry, ALL_FIELD_TYPES, getEventDeclarations
 * - utils.ts     → getComponentCategory, isFormComponent, getComponentLabel 等
 */

// ============================
// 类型 re-export
// ============================

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
import type { HtmlProps } from './html/'
import type { JsxProps } from './jsx/'
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
  HtmlProps,
  JsxProps,
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
// 注册表 re-export
// ============================

export { componentRegistry, getEventDeclarations, ALL_FIELD_TYPES } from './registry'

// ============================
// 查询工具函数 re-export
// ============================

export {
  getComponentLabel,
  getComponentCategory,
  isFormComponent,
  isDisplayComponent,
  isContainerComponent,
  isButtonComponent,
  getComponentIconName,
  getComponentIcon,
  getComponentDefaultProps,
  getFormFieldTypes,
  getContainerFieldTypes,
} from './utils'

// ============================
// 图标 re-export（保持兼容）
// ============================

export { iconMap } from './icons'