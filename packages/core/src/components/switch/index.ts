import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface SwitchProps extends BaseFormComponentProps<boolean | undefined> {
  checkedChildren?: string
  unCheckedChildren?: string
  size?: 'small' | 'default'
  loading?: boolean
}

export const switchEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.switch.events.onChange.label', description: 'component.switch.events.onChange.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.switch.label',
  category: 'form',
  icon: 'ToggleLeft',
  defaultProps: { componentProps: {} },
  eventDeclarations: switchEventDeclarations,
}
