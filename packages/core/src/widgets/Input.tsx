import React from 'react'
import { getInputControlStyle } from './shared'

export const WidgetInput: React.FC<{
  value?: string | number
  onChange?: (v: string | number) => void
  placeholder?: string
  disabled?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, variant, style }) => {
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
      style={getInputControlStyle({ focused, disabled, variant, style })}
    />
  )
}
