import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Slider */
export interface SliderProps extends BaseFormComponentProps<number | [number, number] | undefined> {
  min?: number
  max?: number
  step?: number
  marks?: Record<number, React.ReactNode>
  dots?: boolean
  included?: boolean
  range?: boolean
  tooltip?: { formatter?: (value: number) => React.ReactNode }
  vertical?: boolean
}

/** Slider 支持的事件声明（供设计器使用） */
export const sliderEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '滑块值变化时持续触发' },
  { name: 'onAfterChange', label: '拖动结束', description: '拖动结束时触发（防抖后的最终值）' },
]


