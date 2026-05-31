import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Checkbox */
export interface CheckboxProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  indeterminate?: boolean
}

/**
 * Checkbox 属性面板配置
 */
export const CheckboxPropConfig = {
  options: { type: 'options', label: '选项列表', default: [] },
} as const
