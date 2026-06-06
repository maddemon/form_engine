import React from 'react'
import { getInputControlStyle } from './shared'

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
      style={getInputControlStyle({ focused, disabled, style })}
    />
  )
}
