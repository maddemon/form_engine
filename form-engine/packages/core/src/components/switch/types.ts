import type { BaseFormComponentProps } from '../../types/component-props'

/** Switch */
export interface SwitchProps extends BaseFormComponentProps<boolean | undefined> {
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  defaultChecked?: boolean
}
