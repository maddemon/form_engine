import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Rate */
export interface RateProps extends BaseFormComponentProps<number | undefined> {
  count?: number
  allowHalf?: boolean
  character?: React.ReactNode
  tooltips?: string[]
}

/**
 * Rate 属性面板配置
 */
export const RatePropConfig = {
  count: { type: 'number', label: '星星数量', default: 5 },
  allowHalf: { type: 'boolean', label: '允许半选', default: false },
} as const
