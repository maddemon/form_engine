import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Flex */
export interface FlexProps extends BaseLayoutComponentProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: number | string
  flex?: number | string
}


