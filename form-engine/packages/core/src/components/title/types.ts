import type { BaseComponentProps } from '../../types/component-props'

/** Title */
export interface TitleProps extends BaseComponentProps {
  level?: 1 | 2 | 3 | 4 | 5
  content?: string
  italic?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  mark?: boolean
  keyboard?: boolean
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  disabled?: boolean
  ellipsis?: boolean | { rows?: number; expandable?: boolean }
  strong?: boolean
}

/**
 * Title 属性面板配置
 */
export const TitlePropConfig = {
  level: {
    type: 'select',
    label: '标题级别',
    default: 1,
    options: [
      { label: 'H1', value: 1 },
      { label: 'H2', value: 2 },
      { label: 'H3', value: 3 },
      { label: 'H4', value: 4 },
      { label: 'H5', value: 5 },
    ],
  },
  content: { type: 'string', label: '标题内容', default: '' },
  strong: { type: 'boolean', label: '加粗', default: false },
  type: {
    type: 'select',
    label: '类型',
    default: undefined,
    options: [
      { label: '默认', value: undefined },
      { label: '次要', value: 'secondary' },
      { label: '成功', value: 'success' },
      { label: '警告', value: 'warning' },
      { label: '危险', value: 'danger' },
    ],
  },
} as const
