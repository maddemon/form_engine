import React from 'react'
import { useStyle } from '../styles'
import { BASE_STYLE, FOCUS_STYLE } from './shared'

export const WidgetSelect: React.FC<{
  value?: string
  onChange?: (v: string | undefined) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  allowClear?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, allowClear = true, style }) => {
  const [open, setOpen] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { token } = useStyle()

  const selectedOption = options.find(o => o.value === value)
  const showClear = allowClear && value !== undefined && value !== '' && !disabled

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
    setOpen(false)
  }

  const handleSelect = (optValue: string) => {
    onChange?.(optValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      {/* trigger */}
      <div
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onClick={() => { if (!disabled) setOpen(!open) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled) setOpen(!open)
          }
          if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        style={{
          ...BASE_STYLE,
          ...(focused ? FOCUS_STYLE : {}),
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 22,
          userSelect: 'none',
          paddingRight: showClear ? 28 : undefined,
          gap: token('spacingXs') as unknown as number,
        }}
      >
        <span style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: selectedOption ? 'var(--fe-text-primary)' : 'var(--fe-text-placeholder)',
        }}>
          {selectedOption ? selectedOption.label : '请选择'}
        </span>
        <span style={{
          flexShrink: 0,
          fontSize: token('widgetInputFontSizeXxs') as string,
          color: 'var(--fe-text-tertiary)',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </div>

      {/* clear button */}
      {showClear && (
        <span
          onClick={handleClear}
          role="button"
          aria-label="清除"
          style={{
            position: 'absolute',
            right: 22,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: 'var(--fe-text-tertiary)',
            fontSize: token('fontSizeXs') as string,
            lineHeight: 1,
            padding: token('spacingXxs') as unknown as number,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          ✕
        </span>
      )}

      {/* dropdown */}
      {open && !disabled && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1050,
            background: 'var(--fe-bg-elevated, var(--fe-bg-primary))',
            border: '1px solid var(--fe-border-primary)',
            borderRadius: token('borderRadiusSm') as string,
            boxShadow: token('shadowLg') as string,
            maxHeight: 200,
            overflowY: 'auto',
            marginTop: token('spacingXxs') as unknown as number,
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '4px 8px', color: 'var(--fe-text-tertiary)', fontSize: token('fontSizeSm') as string }}>
              无选项
            </div>
          ) : (
            options.map(opt => {
              const isSelected = opt.value === value
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: token('fontSizeSm') as string,
                    lineHeight: '20px',
                    color: 'var(--fe-text-primary)',
                    background: isSelected ? 'var(--fe-primary-bg)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--fe-bg-secondary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isSelected ? 'var(--fe-primary-bg)' : 'transparent'
                  }}
                >
                  {opt.label}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}