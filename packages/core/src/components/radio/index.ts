import { getDefaultOptions } from '../../locale'
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
  {
    name: 'onChange',
    label: 'component.radio.events.onChange.label',
    description: 'component.radio.events.onChange.description',
  },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.radio.label',
  category: 'form',
  icon: 'CircleDot',
  defaultProps: (locale) => ({
    dataSource: {
      type: 'static',
      static: { options: getDefaultOptions(locale!.component.radio.defaultOptionTemplate, 3) },
    },
  }),
  eventDeclarations: radioEventDeclarations,
}
