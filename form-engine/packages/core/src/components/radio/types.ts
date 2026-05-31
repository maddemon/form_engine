import type { OptionItem, BaseFormComponentProps } from '../../types/component-props'

/** Radio */
export interface RadioProps extends BaseFormComponentProps<string | number | undefined> {
  options?: OptionItem[]
  optionType?: 'default' | 'button'
  buttonStyle?: 'outline' | 'solid'
}
