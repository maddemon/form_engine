import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Container */
export interface ContainerProps extends BaseLayoutComponentProps {
  layout?: 'horizontal' | 'vertical'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around'
  align?: 'start' | 'end' | 'center' | 'stretch'
  wrap?: boolean
  background?: string
  borderRadius?: number
  border?: string
  minHeight?: number
}

/**
 * Container 属性面板配置
 */
export const ContainerPropConfig = {
  layout: {
    type: 'select',
    label: '布局方向',
    default: 'vertical',
    options: [
      { label: '垂直', value: 'vertical' },
      { label: '水平', value: 'horizontal' },
    ],
  },
  justify: {
    type: 'select',
    label: '主轴对齐',
    default: 'start',
    options: [
      { label: '起始', value: 'start' },
      { label: '结束', value: 'end' },
      { label: '居中', value: 'center' },
      { label: '两端对齐', value: 'between' },
      { label: '等距', value: 'around' },
    ],
  },
  align: {
    type: 'select',
    label: '交叉轴对齐',
    default: 'stretch',
    options: [
      { label: '起始', value: 'start' },
      { label: '结束', value: 'end' },
      { label: '居中', value: 'center' },
      { label: '拉伸', value: 'stretch' },
    ],
  },
  wrap: { type: 'boolean', label: '自动换行', default: false },
  background: { type: 'color', label: '背景色', default: undefined },
  borderRadius: { type: 'number', label: '圆角', default: 0 },
  minHeight: { type: 'number', label: '最小高度', default: undefined },
} as const
