import type { ComponentRegistration } from '../../types/component'
import { inputEventDeclarations } from '../input'

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.password.label',
  category: 'form',
  icon: 'Lock',
  defaultProps: { componentProps: { allowClear: true } },
  eventDeclarations: inputEventDeclarations,
}
