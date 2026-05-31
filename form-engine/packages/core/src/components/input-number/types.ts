import type { BaseFormComponentProps } from '../../types/component-props'

/** InputNumber */
export interface InputNumberProps extends BaseFormComponentProps<number | null | undefined> {
  min?: number
  max?: number
  step?: number
  precision?: number
  decimalSeparator?: string
  formatter?: (value: number | string) => string
  parser?: (displayValue: string) => number
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}
