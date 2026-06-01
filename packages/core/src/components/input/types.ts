import type { BaseFormComponentProps } from '../../types/component-props'

/** Input & Password */
export interface InputProps extends BaseFormComponentProps<string | undefined> {
  maxLength?: number
  showCount?: boolean
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  addonBefore?: React.ReactNode
  addonAfter?: React.ReactNode
  type?: 'text' | 'password' | 'email' | 'tel' | 'url'
  autoComplete?: string
}


