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

/**
 * Slider 属性面板配置
 */
export const SliderPropConfig = {
  min: { type: 'number', label: '最小值', default: 0 },
  max: { type: 'number', label: '最大值', default: 100 },
  step: { type: 'number', label: '步长', default: 1 },
  range: { type: 'boolean', label: '范围选择', default: false },
  vertical: { type: 'boolean', label: '垂直', default: false },
  dots: { type: 'boolean', label: '显示刻度点', default: false },
} as const
