import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Slider */
export interface SliderProps extends BaseFormComponentProps<number | [number, number] | undefined> {
  min?: number
  max?: number
  step?: number
  marks?: Record<number, React.ReactNode>
  dots?: boolean
  included?: boolean
  range?: boolean
  tooltip?: { formatter?: (value: number) => React.ReactNode }
  vertical?: boolean
}


