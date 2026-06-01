import React from 'react'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

export const WidgetSelect: React.FC<{
  value?: string
  onChange?: (v: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        appearance: 'auto',
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {!value && (
        <option value="" disabled>请选择</option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
