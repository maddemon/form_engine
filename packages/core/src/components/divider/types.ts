import type { BaseComponentProps } from '../../types/component-props'

/** Divider */
export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'center' | 'right'
  plain?: boolean
  children?: React.ReactNode
}

/**
 * Divider 属性面板配置
 */
export const DividerPropConfig = {
  type: {
    type: 'select',
    label: '分割线类型',
    default: 'horizontal',
    options: [
      { label: '水平', value: 'horizontal' },
      { label: '垂直', value: 'vertical' },
    ],
  },
  orientation: {
    type: 'select',
    label: '文字位置',
    default: 'center',
    options: [
      { label: '左', value: 'left' },
      { label: '中', value: 'center' },
      { label: '右', value: 'right' },
    ],
  },
  plain: { type: 'boolean', label: '纯文本', default: false },
} as const
