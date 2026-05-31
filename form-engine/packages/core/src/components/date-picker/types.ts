import type { BaseFormComponentProps } from '../../types/component-props'

/** DatePicker */
export interface DatePickerProps extends BaseFormComponentProps<string | null | undefined> {
  format?: string
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  showTime?: boolean | object
  disabledDate?: (currentDate: string) => boolean
  placeholder?: string
  allowClear?: boolean
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
}

/** DateRange */
export interface DateRangeProps extends BaseFormComponentProps<[string, string] | null | undefined> {
  format?: string
  showTime?: boolean | object
  disabledDate?: (currentDate: string) => boolean
  startPlaceholder?: string
  endPlaceholder?: string
  allowClear?: boolean
}
