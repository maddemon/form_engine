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
  { name: 'onChange', label: 'component.slider.events.onChange.label', description: 'component.slider.events.onChange.description' },
  { name: 'onAfterChange', label: 'component.slider.events.onAfterChange.label', description: 'component.slider.events.onAfterChange.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.slider.label',
  category: 'form',
  icon: 'Sliders',
  defaultProps: { componentProps: { min: 0, max: 100, step: 1 } },
  eventDeclarations: sliderEventDeclarations,
}
