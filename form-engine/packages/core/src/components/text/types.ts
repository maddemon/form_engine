import type { BaseComponentProps } from '../../types/component-props'

/** Text */
export interface TextProps extends BaseComponentProps {
  content?: string
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  strong?: boolean
  italic?: boolean
  keyboard?: boolean
  mark?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  disabled?: boolean
  ellipsis?: boolean | { rows?: number; expandable?: boolean }
}

/**
 * Text 属性面板配置
 */
export const TextPropConfig = {
  content: { type: 'string', label: '文本内容', default: '' },
  type: {
    type: 'select',
    label: '文本类型',
    default: undefined,
    options: [
      { label: '默认', value: undefined },
      { label: '次要', value: 'secondary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
    ],
  },
  strong: { type: 'boolean', label: '加粗', default: false },
  italic: { type: 'boolean', label: '斜体', default: false },
  underline: { type: 'boolean', label: '下划线', default: false },
  delete: { type: 'boolean', label: '删除线', default: false },
  code: { type: 'boolean', label: '代码', default: false },
  mark: { type: 'boolean', label: '标记', default: false },
  keyboard: { type: 'boolean', label: '键盘', default: false },
  ellipsis: { type: 'boolean', label: '溢出省略', default: false },
} as const
