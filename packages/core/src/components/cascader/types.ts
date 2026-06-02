import type { OptionItem } from '../../types/schema'
import type { EventDeclaration } from '../../types/events'

export interface CascaderProps {
  value?: string[]
  onChange?: (value: string[]) => void
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  expandTrigger?: 'click' | 'hover'
}

/** Cascader 支持的事件声明（供设计器使用） */
export const cascaderEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中项变化时触发' },
  { name: 'onPopupVisibleChange', label: '面板显隐', description: '弹出/收起面板时触发' },
]