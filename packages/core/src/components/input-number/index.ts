import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface InputNumberProps extends BaseFormComponentProps<number | undefined> {
  placeholder?: string
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  allowClear?: boolean
  prefix?: string
  suffix?: string
  formatter?: (value: number | undefined) => string
  parser?: (value: string) => number
  decimalSeparator?: string
}

export const inputNumberEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.inputNumber.events.onChange.label', description: 'component.inputNumber.events.onChange.description' },
  { name: 'onBlur', label: 'component.inputNumber.events.onBlur.label', description: 'component.inputNumber.events.onBlur.description' },
  { name: 'onPressEnter', label: 'component.inputNumber.events.onPressEnter.label', description: 'component.inputNumber.events.onPressEnter.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.inputNumber.label',
  category: 'form',
  icon: 'NumberOutlined',
  defaultProps: { componentProps: { allowClear: true } },
  eventDeclarations: inputNumberEventDeclarations,
}
