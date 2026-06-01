import React from 'react'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

export const WidgetInput: React.FC<{
  value?: string | number
  onChange?: (v: string | number) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
    />
  )
}
