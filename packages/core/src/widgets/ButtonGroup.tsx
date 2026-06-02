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
              padding: '3px 8px',
              fontSize: token('fontSizeSm') as string,
              lineHeight: '20px',
              border: `1px solid ${isActive ? token('primary') as string : token('borderPrimary') as string}`,
              borderRight: isLast ? `1px solid ${isActive ? token('primary') as string : token('borderPrimary') as string}` : 'none',
              background: isActive ? token('primary') as string : token('bgPrimary') as string,
              color: isActive ? token('bgPrimary') as string : token('textPrimary') as string,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              borderRadius: isFirst ? token('borderRadiusSm') as string : 0,
              borderTopRightRadius: isLast ? token('borderRadiusSm') as string : 0,
              borderBottomRightRadius: isLast ? token('borderRadiusSm') as string : 0,
              outline: 'none',
              transition: token('transitionAll') as string,
              boxSizing: 'border-box',
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
