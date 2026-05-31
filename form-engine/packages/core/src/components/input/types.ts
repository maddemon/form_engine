import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Input & Password */
export interface InputProps extends BaseFormComponentProps<string | undefined> {
  maxLength?: number
  showCount?: boolean
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  type?: 'text' | 'password' | 'email' | 'tel' | 'url'
  autoComplete?: string
}

/**
 * Input 属性面板配置
 * 定义哪些 props 需要在设计器中可配置，以及使用什么编辑器
 */
export const InputPropConfig = {
  placeholder: { type: 'string', label: '占位文本', default: '' },
  maxLength: { type: 'number', label: '最大长度', default: undefined },
  showCount: { type: 'boolean', label: '显示计数', default: false },
  allowClear: { type: 'boolean', label: '允许清除', default: false },
  type: {
    type: 'select',
    label: '输入类型',
    default: 'text',
    options: [
      { label: '文本', value: 'text' },
      { label: '密码', value: 'password' },
      { label: '邮箱', value: 'email' },
      { label: '电话', value: 'tel' },
      { label: 'URL', value: 'url' },
    ],
  },
} as const
