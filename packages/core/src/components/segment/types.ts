import type { BaseComponentProps } from '../../types/component-props'
import type { OptionItem } from '../../types/schema'
import type { EventDeclaration } from '../../types/events'

/** Segment 分段控制器 */
export interface SegmentProps extends BaseComponentProps {
  /** 选项列表 */
  options: OptionItem[]
  /** 当前选中值 */
  value?: string | number
  /** 默认值 */
  defaultValue?: string | number
  /** 尺寸 */
  size?: 'large' | 'middle' | 'small'
  /** 块级（宽度撑满） */
  block?: boolean
  /** 选中变化回调 */
  onChange?: (value: string | number) => void
}

export const segmentEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '选中变化', description: '选中项变化时触发，参数为新值' },
]
