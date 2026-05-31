import type { BaseFormComponentProps } from '../../types/component-props'

/** TextArea */
export interface TextAreaProps extends BaseFormComponentProps<string | undefined> {
  rows?: number
  autoSize?: boolean | { minRows?: number; maxRows?: number }
  showCount?: boolean
  maxLength?: number
}
