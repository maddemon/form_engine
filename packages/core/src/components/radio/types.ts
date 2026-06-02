import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Radio */
export interface RadioProps extends BaseFormComponentProps<string | undefined> {
  options?: OptionItem[]
  buttonStyle?: 'outline' | 'solid'
  optionType?: 'default' | 'button'
  direction?: 'horizontal' | 'vertical'
}

/** Radio 支持的事件声明（供设计器使用） */
export const radioEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中项变化时触发' },
]


