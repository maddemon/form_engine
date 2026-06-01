import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** InputNumber */
export interface InputNumberProps extends BaseFormComponentProps<number | undefined> {
  min?: number
  max?: number
  step?: number
  precision?: number
  decimalSeparator?: string
  formatter?: (value: number | string) => string
  parser?: (displayValue: string) => number | string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}


