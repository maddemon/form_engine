import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface SliderProps extends BaseFormComponentProps<number | undefined> {
  min?: number
  max?: number
  step?: number
  marks?: Record<number, string>
  tooltip?: { formatter?: string }
  showInput?: boolean
}

export const sliderEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '滑块值变化时触发' },
  { name: 'onAfterChange', label: '拖拽结束', description: '与 onmouseup 触发时机一致，把当前值作为参数传入' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '滑块',
  category: 'form',
  icon: 'Sliders',
  defaultProps: { componentProps: { min: 0, max: 100, step: 1 } },
  eventDeclarations: sliderEventDeclarations,
}
