import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface TransferProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  titles?: [string, string]
  showSearch?: boolean
  disabled?: boolean
  pagination?: boolean
}

export const transferEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中项变化时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
]

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
  { label: '选项四', value: 'option4' },
  { label: '选项五', value: 'option5' },
]

export const meta: ComponentRegistration = {
  label: '穿梭框',
  category: 'form',
  icon: 'ArrowLeftRight',
  defaultProps: { dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } } },
  eventDeclarations: transferEventDeclarations,
}
