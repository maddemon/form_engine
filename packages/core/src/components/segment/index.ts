import type { BaseComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface SegmentProps extends BaseComponentProps {
  options: OptionItem[]
  value?: string | number
  defaultValue?: string | number
  size?: 'large' | 'middle' | 'small'
  block?: boolean
  onChange?: (value: string | number) => void
}

export const segmentEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '选中变化', description: '选中项变化时触发，参数为新值' },
]

export { default as Props } from './Props'

const DEFAULT_OPTIONS = [
  { label: '选项1', value: 'option_1' },
  { label: '选项2', value: 'option_2' },
  { label: '选项3', value: 'option_3' },
]

export const meta: ComponentRegistration = {
  label: '分段控制',
  category: 'display',
  icon: 'SegmentIcon',
  defaultProps: {
    dataSource: { type: 'static', static: { options: DEFAULT_OPTIONS } },
    componentProps: { size: 'middle', block: false },
  },
  eventDeclarations: segmentEventDeclarations,
}
