import type { BaseComponentProps } from '../../types/component-props'

/** Button */
export interface ButtonProps extends BaseComponentProps {
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
  htmlType?: 'button' | 'submit' | 'reset'
  loading?: boolean
  danger?: boolean
}
