import type { OptionItem } from '../../types/schema'

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