import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Rate */
export interface RateProps extends BaseFormComponentProps<number | undefined> {
  count?: number
  allowHalf?: boolean
  character?: React.ReactNode
  tooltips?: string[]
}

/** Rate 支持的事件声明（供设计器使用） */
export const rateEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '评分变化时触发' },
  { name: 'onHoverChange', label: '悬停', description: '鼠标悬停时触发（参数为悬停的分数）' },
]


