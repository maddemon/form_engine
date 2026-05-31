import type { BaseFormComponentProps } from '../../types/component-props'

/** Switch */
export interface SwitchProps extends BaseFormComponentProps<boolean | undefined> {
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  size?: 'small' | 'default'
}

/**
 * Switch 属性面板配置
 */
export const SwitchPropConfig = {
  defaultChecked: { type: 'boolean', label: '默认选中', default: false },
  size: {
    type: 'select',
    label: '尺寸',
    default: 'default',
    options: [
      { label: '默认', value: 'default' },
      { label: '小', value: 'small' },
    ],
  },
} as const
