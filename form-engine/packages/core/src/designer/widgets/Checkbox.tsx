import React from 'react'

export const WidgetCheckbox: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => (
  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: 12, ...style }}>
    <input
      type="checkbox"
      checked={!!checked}
      onChange={e => onChange?.(e.target.checked)}
      disabled={disabled}
      style={{ margin: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
    />
    <span>{checked ? '是' : '否'}</span>
  </label>
)
