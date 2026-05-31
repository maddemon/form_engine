import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Container */
export interface ContainerProps extends BaseLayoutComponentProps {
  layout?: 'horizontal' | 'vertical'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around'
  align?: 'start' | 'end' | 'center' | 'stretch'
  wrap?: boolean
  background?: string
  borderRadius?: number
  border?: string
  minHeight?: number
}
