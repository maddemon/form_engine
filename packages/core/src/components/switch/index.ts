import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface SwitchProps extends BaseFormComponentProps<boolean | undefined> {
  checkedChildren?: string
  unCheckedChildren?: string
  size?: 'small' | 'default'
  loading?: boolean
}

export const switchEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '切换', description: '开关状态变化时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '开关',
  category: 'form',
  icon: 'ToggleLeft',
  defaultProps: { componentProps: {} },
  eventDeclarations: switchEventDeclarations,
}
