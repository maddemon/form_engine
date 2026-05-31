import type { BaseFormComponentProps } from '../../types/component-props'

/** Rate */
export interface RateProps extends BaseFormComponentProps<number | undefined> {
  count?: number
  allowHalf?: boolean
  character?: React.ReactNode
  tooltips?: string[]
}
