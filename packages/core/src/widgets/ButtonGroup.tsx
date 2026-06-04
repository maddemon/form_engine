import React from 'react'
import { useStyle } from '../styles'

export const WidgetButtonGroup: React.FC<{
  value?: string
  onChange?: (v: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, style }) => {
  const { token } = useStyle()

  return (
    <div style={{ display: 'flex', gap: token('widgetCheckboxMargin') as unknown as number, ...style }}>
      {options.map((opt, idx) => {
        const isFirst = idx === 0
        const isLast = idx === options.length - 1
        const isActive = (value ?? options[0]?.value) === opt.value
        return (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={() => onChange?.(opt.value)}
            style={{
              flex: 1,
              minWidth: 28,
              padding: '0 8px',
              fontSize: token('fontSizeSm') as string,
              lineHeight: '22px',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: isActive ? (token('primary') as string) : (token('borderPrimary') as string),
              borderRightWidth: isLast ? 1 : 0,
              borderRightStyle: isLast ? 'solid' : 'none',
              background: isActive ? (token('primary') as string) : (token('bgPrimary') as string),
              color: isActive ? '#' + 'fff' : (token('textPrimary') as string),
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              borderRadius: isFirst ? (token('borderRadiusSm') as string) : 0,
              borderTopRightRadius: isLast ? (token('borderRadiusSm') as string) : 0,
              borderBottomRightRadius: isLast ? (token('borderRadiusSm') as string) : 0,
              outline: 'none',
              transition: token('transitionAll') as string,
              boxSizing: 'border-box',
              ...style,
            }}
            onMouseEnter={(e) => {
              if (!isActive && !disabled) {
                e.currentTarget.style.borderColor = token('primary') as string
                e.currentTarget.style.color = token('primary') as string
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !disabled) {
                e.currentTarget.style.borderColor = token('borderPrimary') as string
                e.currentTarget.style.color = token('textPrimary') as string
              }
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
