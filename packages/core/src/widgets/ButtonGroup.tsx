import React from 'react'
import { BASE_STYLE } from './shared'

export const WidgetButtonGroup: React.FC<{
  value?: string
  onChange?: (v: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, style }) => {
  return (
    <div style={{ display: 'flex', gap: 0, ...style }}>
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
              fontSize: 12,
              lineHeight: '20px',
              border: `1px solid ${isActive ? '#1677ff' : '#d9d9d9'}`,
              borderRight: isLast ? `1px solid ${isActive ? '#1677ff' : '#d9d9d9'}` : 'none',
              background: isActive ? '#1677ff' : '#fff',
              color: isActive ? '#fff' : '#333',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              borderRadius: isFirst ? 4 : 0,
              borderTopRightRadius: isLast ? 4 : 0,
              borderBottomRightRadius: isLast ? 4 : 0,
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => {
              if (!isActive && !disabled) {
                e.currentTarget.style.borderColor = '#1677ff'
                e.currentTarget.style.color = '#1677ff'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive && !disabled) {
                e.currentTarget.style.borderColor = '#d9d9d9'
                e.currentTarget.style.color = '#333'
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