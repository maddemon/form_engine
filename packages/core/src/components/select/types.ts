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

/**
 * Select 属性面板配置
 */
export const SelectPropConfig = {
  placeholder: { type: 'string', label: '占位文本', default: '' },
  showSearch: { type: 'boolean', label: '可搜索', default: false },
  allowClear: { type: 'boolean', label: '允许清除', default: false },
  mode: {
    type: 'select',
    label: '选择模式',
    default: undefined,
    options: [
      { label: '单选', value: undefined },
      { label: '多选', value: 'multiple' },
      { label: '标签', value: 'tags' },
    ],
  },
  maxTagCount: { type: 'number', label: '最大标签数', default: undefined },
} as const
