import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface RadioProps extends BaseFormComponentProps<string | number | undefined> {
  options?: OptionItem[]
  direction?: 'horizontal' | 'vertical'
  optionType?: 'default' | 'button'
  buttonStyle?: 'outline' | 'solid'
}

export const radioEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.radio.events.onChange.label', description: 'component.radio.events.onChange.description' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

export const meta: ComponentRegistration = {
  label: 'component.radio.label',
  category: 'form',
  icon: 'CircleDot',
  defaultProps: { dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } } },
  eventDeclarations: radioEventDeclarations,
}
