import type { BaseFormComponentProps } from '../../types/component-props'

/** DatePicker */
export interface DatePickerProps extends BaseFormComponentProps<string | undefined> {
  format?: string
  showTime?: boolean | { format?: string }
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  placeholder?: string
  allowClear?: boolean
  disabledDate?: (currentDate: string) => boolean
  minDate?: string
  maxDate?: string
}

/** DateRangePicker */
export interface DateRangeProps extends Omit<BaseFormComponentProps<string[] | undefined>, 'placeholder'> {
  format?: string
  showTime?: boolean | { format?: string }
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  placeholder?: [string, string]
  allowClear?: boolean
  disabledDate?: (currentDate: string) => boolean
}


