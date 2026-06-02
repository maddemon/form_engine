import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Input & Password */
export interface InputProps extends BaseFormComponentProps<string | undefined> {
  maxLength?: number
  showCount?: boolean
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  type?: 'text' | 'password' | 'email' | 'tel' | 'url'
  autoComplete?: string
  visibilityToggle?: boolean
}

/** Input 支持的事件声明（供设计器使用） */
export const inputEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '输入框值变化时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车时触发' },
]


