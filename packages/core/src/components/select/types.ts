import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Select */
export interface SelectProps extends BaseFormComponentProps<string | string[] | undefined> {
  options?: OptionItem[]
  mode?: 'multiple' | 'tags'
  showSearch?: boolean
  filterOption?: boolean | ((input: string, option: OptionItem) => boolean)
  allowClear?: boolean
  maxTagCount?: number
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
  onSearch?: (value: string) => void
  notFoundContent?: React.ReactNode
}

/** Select 支持的事件声明（供设计器使用） */
export const selectEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中值变化时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onPopupScroll', label: '下拉滚动', description: '下拉列表滚动时触发（用于远程加载）' },
]


