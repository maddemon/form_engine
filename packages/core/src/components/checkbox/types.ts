import type { BaseFormComponentProps } from '../../types/component-props'
import type { OptionItem } from '../../types/schema'

/** Checkbox */
export interface CheckboxProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  indeterminate?: boolean
  direction?: 'horizontal' | 'vertical'
}


