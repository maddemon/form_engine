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
  { name: 'onClick', label: '点击', description: '点击按钮时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '按钮',
  category: 'button',
  icon: 'Square',
  defaultProps: { componentProps: { children: '按钮' } },
  eventDeclarations: buttonEventDeclarations,
}
