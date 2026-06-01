import type { BaseFormComponentProps } from '../../types/component-props'

/** TextArea */
export interface TextAreaProps extends BaseFormComponentProps<string | undefined> {
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  allowClear?: boolean
}

/**
 * TextArea 属性面板配置
 */
export const TextAreaPropConfig = {
  placeholder: { type: 'string', label: '占位文本', default: '' },
  rows: { type: 'number', label: '行数', default: 4 },
  maxLength: { type: 'number', label: '最大长度', default: undefined },
  showCount: { type: 'boolean', label: '显示计数', default: false },
  allowClear: { type: 'boolean', label: '允许清除', default: false },
  autoSize: { type: 'boolean', label: '自适应高度', default: false },
} as const
