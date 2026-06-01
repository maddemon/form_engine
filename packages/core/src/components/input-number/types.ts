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

/**
 * InputNumber 属性面板配置
 */
export const InputNumberPropConfig = {
  min: { type: 'number', label: '最小值', default: undefined },
  max: { type: 'number', label: '最大值', default: undefined },
  step: { type: 'number', label: '步长', default: 1 },
  precision: { type: 'number', label: '精度', default: undefined },
  decimalSeparator: { type: 'string', label: '小数分隔符', default: '.' },
} as const
