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
  { name: 'onChange', label: 'component.select.events.onChange.label', description: 'component.select.events.onChange.description' },
  { name: 'onSearch', label: 'component.select.events.onSearch.label', description: 'component.select.events.onSearch.description' },
  { name: 'onFocus', label: 'component.select.events.onFocus.label', description: 'component.select.events.onFocus.description' },
  { name: 'onBlur', label: 'component.select.events.onBlur.label', description: 'component.select.events.onBlur.description' },
  { name: 'onDropdownVisibleChange', label: 'component.select.events.onDropdownVisibleChange.label', description: 'component.select.events.onDropdownVisibleChange.description' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

export const meta: ComponentRegistration = {
  label: 'component.select.label',
  category: 'form',
  icon: 'ChevronDown',
  defaultProps: {
    componentProps: { allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: selectEventDeclarations,
}
