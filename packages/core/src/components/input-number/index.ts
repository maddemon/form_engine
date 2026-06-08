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
  { name: 'onChange', label: '值变化', description: '输入框内容变化时触发' },
  { name: 'onBlur', label: '失焦', description: '输入框失去焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车键时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '数字输入',
  category: 'form',
  icon: 'NumberOutlined',
  defaultProps: { componentProps: { placeholder: '请输入数字', allowClear: true } },
  eventDeclarations: inputNumberEventDeclarations,
}
