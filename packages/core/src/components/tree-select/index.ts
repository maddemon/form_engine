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
  { name: 'onChange', label: '值变化', description: '选中节点变化时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
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
  label: '树选择',
  category: 'form',
  icon: 'GitFork',
  defaultProps: {
    componentProps: { placeholder: '请选择', allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: treeSelectEventDeclarations,
}
