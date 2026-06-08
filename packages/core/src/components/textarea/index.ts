import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface TextAreaProps extends BaseFormComponentProps<string | undefined> {
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  allowClear?: boolean
}

export const textAreaEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.textarea.events.onChange.label', description: 'component.textarea.events.onChange.description' },
  { name: 'onFocus', label: 'component.textarea.events.onFocus.label', description: 'component.textarea.events.onFocus.description' },
  { name: 'onBlur', label: 'component.textarea.events.onBlur.label', description: 'component.textarea.events.onBlur.description' },
  { name: 'onPressEnter', label: 'component.textarea.events.onPressEnter.label', description: 'component.textarea.events.onPressEnter.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.textarea.label',
  category: 'form',
  icon: 'FileText',
  defaultProps: {},
  eventDeclarations: textAreaEventDeclarations,
}
