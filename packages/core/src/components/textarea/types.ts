import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** TextArea */
export interface TextAreaProps extends BaseFormComponentProps<string | undefined> {
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  allowClear?: boolean
}

/** TextArea 支持的事件声明（供设计器使用） */
export const textAreaEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '文本域值变化时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车时触发' },
]


