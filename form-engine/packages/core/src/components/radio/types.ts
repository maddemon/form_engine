import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Radio */
export interface RadioProps extends BaseFormComponentProps<string | undefined> {
  options?: OptionItem[]
  buttonStyle?: 'outline' | 'solid'
  optionType?: 'default' | 'button'
}

/**
 * Radio 属性面板配置
 */
export const RadioPropConfig = {
  options: { type: 'options', label: '选项列表', default: [] },
  optionType: {
    type: 'select',
    label: '选项类型',
    default: 'default',
    options: [
      { label: '默认', value: 'default' },
      { label: '按钮', value: 'button' },
    ],
  },
  buttonStyle: {
    type: 'select',
    label: '按钮样式',
    default: 'outline',
    options: [
      { label: '描边', value: 'outline' },
      { label: '填充', value: 'solid' },
    ],
  },
} as const
