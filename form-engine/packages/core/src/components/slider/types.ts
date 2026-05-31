import type { BaseFormComponentProps } from '../../types/component-props'

/** Slider */
export interface SliderProps extends BaseFormComponentProps<number | [number, number] | undefined> {
  min?: number
  max?: number
  step?: number
  range?: boolean
  marks?: Record<number, React.ReactNode>
  tooltip?: { formatter?: (value: number) => React.ReactNode }
  vertical?: boolean
}
