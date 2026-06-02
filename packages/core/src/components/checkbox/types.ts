import type { BaseFormComponentProps } from '../../types/component-props'
import type { OptionItem } from '../../types/schema'
import type { EventDeclaration } from '../../types/events'

/** Checkbox */
export interface CheckboxProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  indeterminate?: boolean
  direction?: 'horizontal' | 'vertical'
}

/** Checkbox 支持的事件声明（供设计器使用） */
export const checkboxEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '勾选项变化时触发' },
]


