import type { BaseComponentProps } from '../../types/component-props'

/** Button */
export interface ButtonProps extends BaseComponentProps {
  children?: React.ReactNode
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text'
  htmlType?: 'button' | 'submit' | 'reset'
  loading?: boolean
  danger?: boolean
}

/**
 * Button 属性面板配置
 */
export const ButtonPropConfig = {
  type: {
    type: 'select',
    label: '按钮类型',
    default: 'default',
    options: [
      { label: '默认', value: 'default' },
      { label: '主要', value: 'primary' },
      { label: '虚线', value: 'dashed' },
      { label: '链接', value: 'link' },
      { label: '文本', value: 'text' },
    ],
  },
  htmlType: {
    type: 'select',
    label: 'HTML 类型',
    default: 'button',
    options: [
      { label: 'button', value: 'button' },
      { label: 'submit', value: 'submit' },
      { label: 'reset', value: 'reset' },
    ],
  },
  danger: { type: 'boolean', label: '危险按钮', default: false },
  loading: { type: 'boolean', label: '加载中', default: false },
} as const
