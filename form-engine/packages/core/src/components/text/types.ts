import type { BaseComponentProps } from '../../types/component-props'

/** Text */
export interface TextProps extends BaseComponentProps {
  content?: string
  fontSize?: number | string
  color?: string
  fontWeight?: number | string
  lineHeight?: number | string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  bold?: boolean
  italic?: boolean
  underline?: boolean
}
