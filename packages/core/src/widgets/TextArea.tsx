import React from 'react'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

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
        style={{
          ...BASE_STYLE,
          resize: 'vertical',
          minHeight: 36,
          ...(focused ? FOCUS_STYLE : {}),
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
      />
    )
  },
)
