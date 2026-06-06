import type { BaseComponentProps } from '../../types/component-props'

/** Title */
export interface TitleProps extends BaseComponentProps {
  level?: 1 | 2 | 3 | 4 | 5
  content?: string
  italic?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  mark?: boolean
  keyboard?: boolean
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  ellipsis?: boolean | { rows?: number; expandable?: boolean }
  strong?: boolean
  textAlign?: 'left' | 'center' | 'right'
}


