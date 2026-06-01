import type { OptionItem, FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

/** Radio */
export interface RadioProps extends BaseFormComponentProps<string | undefined> {
  options?: OptionItem[]
  buttonStyle?: 'outline' | 'solid'
  optionType?: 'default' | 'button'
}


