import type { OptionItem } from '../../types/schema'

export interface CascaderProps {
  value?: string[]
  onChange?: (value: string[]) => void
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  expandTrigger?: 'click' | 'hover'
}