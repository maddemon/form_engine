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
  { name: 'onChange', label: '值变化', description: '输入框内容变化时触发' },
  { name: 'onBlur', label: '失焦', description: '输入框失去焦点时触发' },
  { name: 'onFocus', label: '聚焦', description: '输入框获得焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车键时触发' },
]

export const textAreaEventDeclarations: EventDeclaration[] = inputEventDeclarations

export { default as Props } from './Props'

export const inputMeta: ComponentRegistration = {
  label: '输入框',
  category: 'form',
  icon: 'Edit',
  defaultProps: { componentProps: { placeholder: '请输入', allowClear: true } },
  eventDeclarations: inputEventDeclarations,
}

export const textAreaMeta: ComponentRegistration = {
  label: '多行文本',
  category: 'form',
  icon: 'AlignLeft',
  defaultProps: { componentProps: { placeholder: '请输入', rows: 3, showCount: false } },
  eventDeclarations: textAreaEventDeclarations,
}
