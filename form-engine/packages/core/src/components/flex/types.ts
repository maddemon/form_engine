import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Flex */
export interface FlexProps extends BaseLayoutComponentProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: number
}
