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
  { name: 'onChange', label: 'component.timePicker.events.onChange.label', description: 'component.timePicker.events.onChange.description' },
  { name: 'onOpenChange', label: 'component.timePicker.events.onOpenChange.label', description: 'component.timePicker.events.onOpenChange.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.timePicker.label',
  category: 'form',
  icon: 'Clock',
  defaultProps: { componentProps: { format: 'HH:mm:ss', allowClear: true } },
  eventDeclarations: timePickerEventDeclarations,
}
