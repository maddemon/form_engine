import React from 'react'
import { useStyle } from '../styles'

export const WidgetCheckbox: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => {
  const { token } = useStyle()
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: token('spacingXs'), cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontSize: token('fontSizeXs'), ...style }}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        style={{ margin: token('widgetCheckboxMargin') as unknown as number, cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <span>{checked ? '是' : '否'}</span>
    </label>
  )
}
