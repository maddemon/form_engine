import type { BaseComponentProps } from '../../types/component-props'

/** Divider */
export interface DividerProps extends BaseComponentProps {
  orientation?: 'left' | 'right' | 'center'
  orientationMargin?: string | number
  dashed?: boolean
  children?: React.ReactNode
}
