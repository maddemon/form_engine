import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Switch */
export interface SwitchProps extends BaseFormComponentProps<boolean | undefined> {
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  size?: 'small' | 'default'
}

/** Switch 支持的事件声明（供设计器使用） */
export const switchEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '开关状态变化时触发' },
  { name: 'onClick', label: '点击', description: '点击开关时触发' },
]


