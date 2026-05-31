import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Grid */
export interface GridProps extends BaseLayoutComponentProps {
  columns?: number
  rows?: number
  gap?: number
  columnGap?: number
  rowGap?: number
}
