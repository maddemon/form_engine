import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** InputNumber */
export interface InputNumberProps extends BaseFormComponentProps<number | undefined> {
  min?: number
  max?: number
  step?: number
  precision?: number
  decimalSeparator?: string
  formatter?: (value: number | string | undefined, info?: { userTyping: boolean; input: string }) => string
  parser?: (displayValue: string | undefined) => number | string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
}

/** InputNumber 支持的事件声明（供设计器使用） */
export const inputNumberEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '数值变化时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onPressEnter', label: '回车', description: '按下回车时触发' },
]


