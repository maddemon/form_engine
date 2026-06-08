import type { ComponentRegistration } from '../../types/component'
import { datePickerEventDeclarations } from '../date-picker'

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.dateTime.label',
  category: 'form',
  icon: 'DateTimeIcon',
  defaultProps: { componentProps: { format: 'YYYY-MM-DD HH:mm', showTime: true, allowClear: true } },
  eventDeclarations: datePickerEventDeclarations,
}
