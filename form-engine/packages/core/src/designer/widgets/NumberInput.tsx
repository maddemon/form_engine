import React from 'react'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

export const WidgetNumberInput: React.FC<{
  value?: number
  onChange?: (v: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, min, max, step = 1, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={e => onChange?.(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
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
