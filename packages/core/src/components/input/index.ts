import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface InputProps extends BaseFormComponentProps<string | undefined> {
  placeholder?: string
  maxLength?: number
  showCount?: boolean
  disabled?: boolean
  allowClear?: boolean
  prefix?: string
  suffix?: string
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  autoComplete?: string
  type?: string
  size?: 'small' | 'middle' | 'large'
  rows?: number
}

export interface TextAreaProps extends Omit<InputProps, 'prefix' | 'suffix'> {
  rows: number
  minRows?: number
  maxRows?: number
  autoSize?: boolean
  showCount?: boolean
}

export const inputEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.input.events.onChange.label', description: 'component.input.events.onChange.description' },
  { name: 'onBlur', label: 'component.input.events.onBlur.label', description: 'component.input.events.onBlur.description' },
  { name: 'onFocus', label: 'component.input.events.onFocus.label', description: 'component.input.events.onFocus.description' },
  { name: 'onPressEnter', label: 'component.input.events.onPressEnter.label', description: 'component.input.events.onPressEnter.description' },
]

export const textAreaEventDeclarations: EventDeclaration[] = inputEventDeclarations

export { default as Props } from './Props'

export const inputMeta: ComponentRegistration = {
  label: 'component.input.label',
  category: 'form',
  icon: 'Edit',
  defaultProps: { componentProps: { allowClear: true } },
  eventDeclarations: inputEventDeclarations,
}

export const textAreaMeta: ComponentRegistration = {
  label: 'component.textarea.label',
  category: 'form',
  icon: 'AlignLeft',
  defaultProps: { componentProps: { rows: 3, showCount: false } },
  eventDeclarations: textAreaEventDeclarations,
}
