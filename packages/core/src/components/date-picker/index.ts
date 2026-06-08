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
  { name: 'onChange', label: '值变化', description: '选中日期变化时触发' },
  { name: 'onCalendarChange', label: '日历面板变化', description: '日历面板月份/年份变化时触发' },
  { name: 'onOpenChange', label: '打开状态', description: '弹出/收起面板时触发' },
  { name: 'onPanelChange', label: '面板变化', description: '面板类型（date/month/year）变化时触发' },
  { name: 'onOk', label: '确认', description: '点击确认按钮时触发' },
]

export const dateRangeEventDeclarations: EventDeclaration[] = datePickerEventDeclarations

export { default as DateRangePropsRender } from './DateRangePropsRender'
export { default as Props } from './Props'

export const dateMeta: ComponentRegistration = {
  label: '日期',
  category: 'form',
  icon: 'Calendar',
  defaultProps: { componentProps: { format: 'YYYY-MM-DD', allowClear: true } },
  eventDeclarations: datePickerEventDeclarations,
}

export const dateRangeMeta: ComponentRegistration = {
  label: '日期范围',
  category: 'form',
  icon: 'DateRangeIcon',
  defaultProps: { componentProps: { format: 'YYYY-MM-DD', allowClear: true } },
  eventDeclarations: dateRangeEventDeclarations,
}
