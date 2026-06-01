import React from 'react'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

export const WidgetTextArea: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, rows = 3, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <textarea
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
        minHeight: 48,
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
    />
  )
}
