import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface CascaderProps extends BaseFormComponentProps<string[]> {
  options?: OptionItem[]
  allowClear?: boolean
  showSearch?: boolean
  expandTrigger?: 'click' | 'hover'
}

export const cascaderEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.cascader.events.onChange.label', description: 'component.cascader.events.onChange.description' },
  { name: 'onPopupVisibleChange', label: 'component.cascader.events.onPopupVisibleChange.label', description: 'component.cascader.events.onPopupVisibleChange.description' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  {
    label: '选项一',
    value: 'option1',
    children: [
      { label: '子选项1-1', value: 'option1-1' },
      { label: '子选项1-2', value: 'option1-2' },
    ],
  },
  {
    label: '选项二',
    value: 'option2',
    children: [{ label: '子选项2-1', value: 'option2-1' }],
  },
  { label: '选项三', value: 'option3' },
]

export const meta: ComponentRegistration = {
  label: 'component.cascader.label',
  category: 'form',
  icon: 'GitBranch',
  defaultProps: {
    componentProps: { allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: cascaderEventDeclarations,
}
