import type { BaseFormComponentProps } from '../../types/component-props'

/** TextArea */
export interface TextAreaProps extends BaseFormComponentProps<string | undefined> {
  rows?: number
  maxLength?: number
  showCount?: boolean
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  allowClear?: boolean
}


