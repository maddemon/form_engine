import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

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

export interface DateRangeProps extends Omit<BaseFormComponentProps<string[] | undefined>, 'placeholder'> {
  format?: string
  showTime?: boolean | { format?: string }
  picker?: 'date' | 'week' | 'month' | 'quarter' | 'year'
  placeholder?: [string, string]
  allowClear?: boolean
  disabledDate?: (currentDate: string) => boolean
}

export const datePickerEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.datePicker.events.onChange.label', description: 'component.datePicker.events.onChange.description' },
  { name: 'onCalendarChange', label: 'component.datePicker.events.onCalendarChange.label', description: 'component.datePicker.events.onCalendarChange.description' },
  { name: 'onOpenChange', label: 'component.datePicker.events.onOpenChange.label', description: 'component.datePicker.events.onOpenChange.description' },
  { name: 'onPanelChange', label: 'component.datePicker.events.onPanelChange.label', description: 'component.datePicker.events.onPanelChange.description' },
  { name: 'onOk', label: 'component.datePicker.events.onOk.label', description: 'component.datePicker.events.onOk.description' },
]

export const dateRangeEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.dateRange.events.onChange.label', description: 'component.dateRange.events.onChange.description' },
  { name: 'onCalendarChange', label: 'component.dateRange.events.onCalendarChange.label', description: 'component.dateRange.events.onCalendarChange.description' },
  { name: 'onOpenChange', label: 'component.dateRange.events.onOpenChange.label', description: 'component.dateRange.events.onOpenChange.description' },
  { name: 'onPanelChange', label: 'component.dateRange.events.onPanelChange.label', description: 'component.dateRange.events.onPanelChange.description' },
  { name: 'onOk', label: 'component.dateRange.events.onOk.label', description: 'component.dateRange.events.onOk.description' },
]

export { default as DateRangePropsRender } from './DateRangePropsRender'
export { default as Props } from './Props'

export const dateMeta: ComponentRegistration = {
  label: 'component.datePicker.label',
  category: 'form',
  icon: 'Calendar',
  defaultProps: { componentProps: { format: 'YYYY-MM-DD', allowClear: true } },
  eventDeclarations: datePickerEventDeclarations,
}

export const dateRangeMeta: ComponentRegistration = {
  label: 'component.dateRange.label',
  category: 'form',
  icon: 'DateRangeIcon',
  defaultProps: { componentProps: { format: 'YYYY-MM-DD', allowClear: true } },
  eventDeclarations: dateRangeEventDeclarations,
}
