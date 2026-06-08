import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface CheckboxProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  indeterminate?: boolean
  direction?: 'horizontal' | 'vertical'
}

export const checkboxEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '勾选项变化时触发' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

export const meta: ComponentRegistration = {
  label: '多选框',
  category: 'form',
  icon: 'CheckSquare',
  defaultProps: { dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } } },
  eventDeclarations: checkboxEventDeclarations,
}
