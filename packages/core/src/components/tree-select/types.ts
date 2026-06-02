import type { OptionItem } from '../../types/schema'
import type { EventDeclaration } from '../../types/events'

export interface TreeSelectProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  showSearch?: boolean
}

/** TreeSelect 支持的事件声明（供设计器使用） */
export const treeSelectEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中节点变化时触发' },
  { name: 'onTreeExpand', label: '展开节点', description: '展开树节点时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
]