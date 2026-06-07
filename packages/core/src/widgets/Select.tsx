import React from 'react'
import { useStyle } from '../styles'
import { InputOverlayButton } from './InputOverlayButton'
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
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  const { token } = useStyle()

  const hasValue = value !== undefined && value !== ''

  // 点击外部关闭下拉
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChangeRef.current?.(undefined)
    setOpen(false)
  }, [])

  const handleSelect = React.useCallback((optValue: string) => {
    onChangeRef.current?.(optValue)
    setOpen(false)
  }, [])

  const handleToggle = React.useCallback(() => {
    if (!disabled) setOpen((prev) => !prev)
  }, [disabled])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!disabled) setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    },
    [disabled],
  )

  const selectedOption = options.find((o) => o.value === value)

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
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{
          ...BASE_STYLE,
          ...(focused ? FOCUS_STYLE : {}),
          position: 'relative',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: 22,
          userSelect: 'none',
          paddingRight: token('spacingLg'),
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedOption ? 'var(--fe-text-primary)' : 'var(--fe-text-placeholder)',
          }}
        >
          {selectedOption ? selectedOption.label : '请选择'}
        </span>

        {/* 箭头图标：有值可清除时隐藏，由清除按钮占据同一位置 */}
        {!(allowClear && hasValue && !disabled) && (
          <span
            style={{
              position: 'absolute',
              right: 1,
              top: '50%',
              transform: 'translateY(-50%)',
              width: token('inputActionSize') as string,
              height: token('inputActionSize') as string,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              fontSize: token('widgetInputFontSizeXxs') as string,
              color: 'var(--fe-text-tertiary)',
              transition: 'transform 0.2s',
            }}
          >
            <span
              style={{
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}
            >
              ▼
            </span>
          </span>
        )}

        {/* 清除按钮：绝对定位，占据箭头同一位置 */}
        {allowClear && hasValue && !disabled && (
          <InputOverlayButton onClick={handleClear} onMouseDown={(e) => e.stopPropagation()} title="清除">
            ✕
          </InputOverlayButton>
        )}
      </div>

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
            <div
              style={{ padding: '4px 8px', color: 'var(--fe-text-tertiary)', fontSize: token('fontSizeSm') as string }}
            >
              无选项
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: token('fontSizeSm') as string,
                    lineHeight: '20px',
                    color: 'var(--fe-text-primary)',
                    background: isSelected ? 'var(--fe-primary-bg)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--fe-bg-secondary)'
                  }}
                  onMouseLeave={(e) => {
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
