import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface TimePickerProps extends BaseFormComponentProps<string | undefined> {
  placeholder?: string
  format?: string
  minuteStep?: number
  secondStep?: number
  allowClear?: boolean
  use12Hours?: boolean
}

export const timePickerEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中时间变化时触发' },
  { name: 'onOpenChange', label: '打开状态', description: '弹出/收起面板时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '时间选择',
  category: 'form',
  icon: 'Clock',
  defaultProps: { componentProps: { format: 'HH:mm:ss', allowClear: true } },
  eventDeclarations: timePickerEventDeclarations,
}
