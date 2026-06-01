import type { BaseLayoutComponentProps } from '../../types/component-props'

/** Flex */
export interface FlexProps extends BaseLayoutComponentProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: number | string
  flex?: number | string
}

/**
 * Flex 属性面板配置
 */
export const FlexPropConfig = {
  direction: {
    type: 'select',
    label: '方向',
    default: 'row',
    options: [
      { label: '行', value: 'row' },
      { label: '行（反向）', value: 'row-reverse' },
      { label: '列', value: 'column' },
      { label: '列（反向）', value: 'column-reverse' },
    ],
  },
  justify: {
    type: 'select',
    label: '主轴对齐',
    default: 'flex-start',
    options: [
      { label: '起始', value: 'flex-start' },
      { label: '结束', value: 'flex-end' },
      { label: '居中', value: 'center' },
      { label: '两端对齐', value: 'space-between' },
      { label: '等距', value: 'space-around' },
      { label: '均匀', value: 'space-evenly' },
    ],
  },
  align: {
    type: 'select',
    label: '交叉轴对齐',
    default: 'stretch',
    options: [
      { label: '起始', value: 'flex-start' },
      { label: '结束', value: 'flex-end' },
      { label: '居中', value: 'center' },
      { label: '基线', value: 'baseline' },
      { label: '拉伸', value: 'stretch' },
    ],
  },
  wrap: {
    type: 'select',
    label: '换行',
    default: 'nowrap',
    options: [
      { label: '不换行', value: 'nowrap' },
      { label: '换行', value: 'wrap' },
      { label: '反向换行', value: 'wrap-reverse' },
    ],
  },
  gap: { type: 'number', label: '间距', default: 0 },
} as const
