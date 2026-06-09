import type { BaseComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface ButtonProps extends BaseComponentProps {
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
  size?: 'small' | 'middle' | 'large'
  loading?: boolean
  danger?: boolean
  icon?: string
  block?: boolean
}

export const buttonEventDeclarations: EventDeclaration[] = [
  { name: 'onClick', label: 'component.button.events.onClick.label', description: 'component.button.events.onClick.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.button.label',
  category: 'button',
  icon: 'Square',
  defaultProps: (locale) => ({ componentProps: { children: locale?.component.button.defaultContent ?? 'Button' } }),
  eventDeclarations: buttonEventDeclarations,
}
