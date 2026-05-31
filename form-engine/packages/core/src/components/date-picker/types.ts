import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps, BaseComponentProps } from '../../types/component-props'

/** DatePicker */
export interface DatePickerProps extends BaseFormComponentProps<string | undefined> {
  format?: string
  showTime?: boolean | { format?: string }
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  placeholder?: string
  allowClear?: boolean
  disabledDate?: (currentDate: string) => boolean
}

/** DateRangePicker */
export interface DateRangeProps extends BaseComponentProps {
  value?: string[] | undefined
  defaultValue?: string[] | undefined
  onChange?: (value: string[] | undefined) => void
  name?: string
  required?: boolean
  rules?: import('../../types/schema').FormRule[]
  visibleWhen?: import('../../types/schema').VisibleWhen
  disabledWhen?: import('../../types/schema').VisibleWhen
  
  format?: string
  showTime?: boolean | { format?: string }
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  placeholder?: [string, string]
  allowClear?: boolean
  disabledDate?: (currentDate: string) => boolean
}

/**
 * DatePicker 属性面板配置
 */
export const DatePickerPropConfig = {
  format: { type: 'string', label: '日期格式', default: 'YYYY-MM-DD' },
  picker: {
    type: 'select',
    label: '选择器类型',
    default: 'date',
    options: [
      { label: '日期', value: 'date' },
      { label: '周', value: 'week' },
      { label: '月', value: 'month' },
      { label: '季度', value: 'quarter' },
      { label: '年', value: 'year' },
    ],
  },
  showTime: { type: 'boolean', label: '显示时间', default: false },
  allowClear: { type: 'boolean', label: '允许清除', default: true },
} as const
