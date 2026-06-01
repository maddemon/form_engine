import type { BaseComponentProps } from '../../types/component-props'

/** Text */
export interface TextProps extends BaseComponentProps {
  content?: string
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  strong?: boolean
  italic?: boolean
  keyboard?: boolean
  mark?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  disabled?: boolean
  ellipsis?: boolean | { rows?: number; expandable?: boolean }
  fontSize?: number
  color?: string
  textAlign?: 'left' | 'center' | 'right'
}


