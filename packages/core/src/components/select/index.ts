import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface SelectProps extends BaseFormComponentProps<string | number | undefined> {
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  loading?: boolean
  mode?: 'multiple' | 'tags'
  maxTagCount?: number
  notFoundContent?: string
  size?: 'small' | 'middle' | 'large'
}

export const selectEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中项变化时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
  { name: 'onFocus', label: '聚焦', description: '选择器获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '选择器失去焦点时触发' },
  { name: 'onDropdownVisibleChange', label: '下拉显隐', description: '下拉/收起展开面板时触发' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

export const meta: ComponentRegistration = {
  label: '下拉选择',
  category: 'form',
  icon: 'ChevronDown',
  defaultProps: {
    componentProps: { placeholder: '请选择', allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: selectEventDeclarations,
}
