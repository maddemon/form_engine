import type { BaseComponentProps, BaseFormComponentProps } from '../../types/component-props'

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


