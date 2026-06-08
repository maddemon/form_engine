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
  { name: 'onChange', label: '值变化', description: '文本域值变化时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车时触发' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '多行文本',
  category: 'form',
  icon: 'FileText',
  defaultProps: {},
  eventDeclarations: textAreaEventDeclarations,
}
