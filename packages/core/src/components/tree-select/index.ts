import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface TreeSelectProps extends BaseFormComponentProps<string | string[] | undefined> {
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  treeDefaultExpandAll?: boolean
}

export const treeSelectEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.treeSelect.events.onChange.label', description: 'component.treeSelect.events.onChange.description' },
  { name: 'onSearch', label: 'component.treeSelect.events.onSearch.label', description: 'component.treeSelect.events.onSearch.description' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  {
    label: '节点一',
    value: 'node1',
    children: [
      { label: '子节点1-1', value: 'node1-1' },
      { label: '子节点1-2', value: 'node1-2' },
    ],
  },
  { label: '节点二', value: 'node2' },
]

export const meta: ComponentRegistration = {
  label: 'component.treeSelect.label',
  category: 'form',
  icon: 'GitFork',
  defaultProps: {
    componentProps: { allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: treeSelectEventDeclarations,
}
