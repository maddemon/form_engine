/**
 * 各组件专用属性配置映射
 *
 * 将各组件 types.ts 中导出的 XXXPropConfig（旧格式）
 * 转换为统一的 PropertyConfigItem[] 格式，供 PropertyPanel 使用。
 *
 * 优先级：
 *   1. 自定义组件 → 使用 customComponentRegistry 中的 propertyConfig
 *   2. 内置组件 → 使用此文件中的映射
 *   3. 都没有 → fallback 到通用属性（基本属性 + 高级属性）
 */
import type { PropertyConfigItem } from '../types/custom-component'

// 导入各组件的 PropConfig（旧格式）
import { ButtonPropConfig } from '../components/button/types'
import { CheckboxPropConfig } from '../components/checkbox/types'
import { DatePickerPropConfig } from '../components/date-picker/types'
import { InputNumberPropConfig } from '../components/input-number/types'
import { InputPropConfig } from '../components/input/types'
import { RadioPropConfig } from '../components/radio/types'
import { RatePropConfig } from '../components/rate/types'
import { SelectPropConfig } from '../components/select/types'
import { SliderPropConfig } from '../components/slider/types'
import { SwitchPropConfig } from '../components/switch/types'
import { TextAreaPropConfig } from '../components/textarea/types'
import { UploadPropConfig } from '../components/upload/types'

/**
 * 将旧格式 PropConfig 转换为 PropertyConfigItem[]
 *
 * 旧格式示例：
 *   { placeholder: { type: 'string', label: '占位文本', default: '' } }
 * 新格式示例：
 *   [{ key: 'placeholder', label: '占位文本', widget: 'input' }]
 */
function convertOldConfig(oldConfig: Record<string, { type: string; label: string; default?: unknown; options?: { label: string; value: unknown }[] }>, groupName?: string): PropertyConfigItem[] {
  const widgetMap: Record<string, PropertyConfigItem['widget']> = {
    string: 'input',
    textarea: 'textarea',
    number: 'number',
    boolean: 'checkbox',
    select: 'select',
    options: 'options', // options 类型用内置 options widget（编辑 OptionItem[]）
  }

  return Object.entries(oldConfig).map(([key, conf]) => {
    const widget = widgetMap[conf.type] || 'input'
    const item: PropertyConfigItem = {
      key,
      label: conf.label,
      widget,
      group: groupName || '组件属性',
    }

    // select 类型需要传递 options
    if (conf.type === 'select' && conf.options) {
      item.widgetProps = {
        options: conf.options as { label: string; value: string | number | boolean }[],
      }
    }

    // options 类型：使用内置 options widget（编辑 OptionItem[]）
    if (conf.type === 'options') {
      item.widget = 'options'
    }

    return item
  })
}

// ============================
// 各组件专用属性配置（新格式）
// ============================

/** input */
export const inputPropertyConfig: PropertyConfigItem[] = convertOldConfig(InputPropConfig, '组件属性')

/** textarea */
export const textareaPropertyConfig: PropertyConfigItem[] = convertOldConfig(TextAreaPropConfig, '组件属性')

/** input-number */
export const inputNumberPropertyConfig: PropertyConfigItem[] = convertOldConfig(InputNumberPropConfig as Record<string, any>, '组件属性')

/** select */
export const selectPropertyConfig: PropertyConfigItem[] = convertOldConfig(SelectPropConfig as Record<string, any>, '组件属性')

/** radio */
export const radioPropertyConfig: PropertyConfigItem[] = convertOldConfig(RadioPropConfig as Record<string, any>, '组件属性')

/** checkbox */
export const checkboxPropertyConfig: PropertyConfigItem[] = convertOldConfig(CheckboxPropConfig as Record<string, any>, '组件属性')

/** switch */
export const switchPropertyConfig: PropertyConfigItem[] = convertOldConfig(SwitchPropConfig as Record<string, any>, '组件属性')

/** slider */
export const sliderPropertyConfig: PropertyConfigItem[] = convertOldConfig(SliderPropConfig as Record<string, any>, '组件属性')

/** rate */
export const ratePropertyConfig: PropertyConfigItem[] = convertOldConfig(RatePropConfig as Record<string, any>, '组件属性')

/** date */
export const datePropertyConfig: PropertyConfigItem[] = convertOldConfig(DatePickerPropConfig as Record<string, any>, '组件属性')

/** date-range（复用 DatePickerPropConfig） */
export const dateRangePropertyConfig: PropertyConfigItem[] = convertOldConfig(DatePickerPropConfig as Record<string, any>, '组件属性')

/** datetime（复用 DatePickerPropConfig） */
export const datetimePropertyConfig: PropertyConfigItem[] = convertOldConfig(DatePickerPropConfig as Record<string, any>, '组件属性')

/** time（复用 DatePickerPropConfig，但只保留 format / showTime） */
export const timePropertyConfig: PropertyConfigItem[] = convertOldConfig(DatePickerPropConfig as Record<string, any>, '组件属性')

/** upload */
export const uploadPropertyConfig: PropertyConfigItem[] = convertOldConfig(UploadPropConfig as Record<string, any>, '组件属性')

/** button（布局组件，无 label/name 等表单属性） */
export const buttonPropertyConfig: PropertyConfigItem[] = convertOldConfig(ButtonPropConfig as Record<string, any>, '组件属性')

// ============================
// 类型 → 属性配置的映射表
// ============================

const componentPropertyConfigMap: Record<string, PropertyConfigItem[]> = {
  input: inputPropertyConfig,
  textarea: textareaPropertyConfig,
  'input-number': inputNumberPropertyConfig,
  password: inputPropertyConfig, // password 复用 input 的配置
  select: selectPropertyConfig,
  'multi-select': selectPropertyConfig, // multi-select 是 select + mode:multiple
  radio: radioPropertyConfig,
  checkbox: checkboxPropertyConfig,
  switch: switchPropertyConfig,
  slider: sliderPropertyConfig,
  rate: ratePropertyConfig,
  date: datePropertyConfig,
  'date-range': dateRangePropertyConfig,
  datetime: datetimePropertyConfig,
  time: timePropertyConfig,
  upload: uploadPropertyConfig,
  button: buttonPropertyConfig,
  // cascader / tree-select 暂未实现，留空
}

/**
 * 根据字段类型获取专用属性配置
 * @param fieldType 字段类型
 * @returns PropertyConfigItem[] 或 null（无专用配置时返回 null，调用方 fallback）
 */
export function getComponentPropertyConfig(fieldType: string): PropertyConfigItem[] | null {
  return componentPropertyConfigMap[fieldType] || null
}
