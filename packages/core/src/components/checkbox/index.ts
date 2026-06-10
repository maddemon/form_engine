import { getDefaultOptions } from '../../locale'
import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface CheckboxProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  indeterminate?: boolean
  direction?: 'horizontal' | 'vertical'
  optionType?: 'default' | 'button'
  buttonStyle?: 'outline' | 'solid'
}

export const checkboxEventDeclarations: EventDeclaration[] = [
  {
    name: 'onChange',
    label: 'component.checkbox.events.onChange.label',
    description: 'component.checkbox.events.onChange.description',
  },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.checkbox.label',
  category: 'form',
  icon: 'CheckSquare',
  defaultProps: (locale) => ({
    dataSource: {
      type: 'static',
      static: { options: getDefaultOptions(locale!.component.checkbox.defaultOptionTemplate, 3) },
    },
  }),
  eventDeclarations: checkboxEventDeclarations,
}
