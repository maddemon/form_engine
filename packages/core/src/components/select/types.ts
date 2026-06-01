import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

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


