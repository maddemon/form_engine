import type { BaseComponentProps } from '../../types/component-props'

/** Divider */
export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical'
  textPlacement?: 'left' | 'center' | 'right'
  plain?: boolean
  children?: React.ReactNode
  color?: string
  thickness?: number
}
