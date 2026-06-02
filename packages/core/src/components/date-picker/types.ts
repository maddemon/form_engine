import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

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

/** DatePicker 支持的事件声明（供设计器使用） */
export const datePickerEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中日期变化时触发' },
  { name: 'onCalendarChange', label: '日历面板变化', description: '日历面板月份/年份变化时触发' },
  { name: 'onOpenChange', label: '打开状态', description: '弹出/收起面板时触发' },
  { name: 'onPanelChange', label: '面板变化', description: '面板类型（date/month/year）变化时触发' },
  { name: 'onOk', label: '确认', description: '点击确认按钮时触发' },
]

/** DateRange 复用 DatePicker 的事件声明（事件签名相同） */
export const dateRangeEventDeclarations: EventDeclaration[] = datePickerEventDeclarations


