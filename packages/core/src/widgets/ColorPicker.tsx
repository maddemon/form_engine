import React from 'react'
import { WidgetInput } from './Input'

export const WidgetColorPicker: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, style }) => (
  <WidgetInput value={value} onChange={(v) => onChange?.(String(v))} placeholder={placeholder} disabled={disabled} style={{ fontFamily: 'monospace', ...style }} />
)
