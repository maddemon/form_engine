import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface RateProps extends BaseFormComponentProps<number | undefined> {
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  size?: number
  color?: string
  character?: string
  tooltips?: string[]
}

export const rateEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '评分值变化时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '评分',
  category: 'form',
  icon: 'Star',
  defaultProps: { componentProps: { count: 5, allowHalf: false, allowClear: true } },
  eventDeclarations: rateEventDeclarations,
}
