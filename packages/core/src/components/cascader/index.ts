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
  { name: 'onChange', label: '值变化', description: '选中项变化时触发' },
  { name: 'onPopupVisibleChange', label: '面板显隐', description: '弹出/收起面板时触发' },
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
  label: '级联选择',
  category: 'form',
  icon: 'GitBranch',
  defaultProps: {
    componentProps: { allowClear: true },
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
  },
  eventDeclarations: cascaderEventDeclarations,
}
