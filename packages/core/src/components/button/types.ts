import type { BaseComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Button */
export interface ButtonProps extends BaseComponentProps {
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
  size?: 'small' | 'middle' | 'large'
  htmlType?: 'button' | 'submit' | 'reset'
  loading?: boolean
  danger?: boolean
  icon?: string
  block?: boolean
}

/** Button 支持的事件声明（供设计器使用） */
export const buttonEventDeclarations: EventDeclaration[] = [
  { name: 'onClick', label: '点击', description: '点击按钮时触发' },
]


