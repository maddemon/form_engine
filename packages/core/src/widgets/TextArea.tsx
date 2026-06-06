import React from 'react'
import { getInputControlStyle } from './shared'

interface WidgetTextAreaProps {
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  style?: React.CSSProperties
}

export const WidgetTextArea = React.forwardRef<HTMLTextAreaElement, WidgetTextAreaProps>(
  ({ value, onChange, placeholder, disabled, rows = 3, style }, ref) => {
    const [focused, setFocused] = React.useState(false)
    return (
      <textarea
        ref={ref}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={getInputControlStyle({ focused, disabled, style: { resize: 'vertical', minHeight: 36, ...style } })}
      />
    )
  },
)
WidgetTextArea.displayName = 'WidgetTextArea'
