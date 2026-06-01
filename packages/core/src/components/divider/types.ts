import type { BaseComponentProps } from '../../types/component-props'

/** Divider */
export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'center' | 'right'
  plain?: boolean
  children?: React.ReactNode
}


