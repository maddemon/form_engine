import React, { useState, useRef } from 'react'
import type { InputNumberProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML InputNumber 组件（默认实现）
 * Ant Design 风格
 */
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision,
  disabled,
  placeholder,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { token, mergeStyle } = useStyle()

  const parseValue = (val: string): number | undefined => {
    if (val === '' || isNaN(Number(val))) return undefined
    let num = Number(val)
    if (precision !== undefined) num = Number(num.toFixed(precision))
    if (min !== undefined && num < min) num = min
    if (max !== undefined && num > max) num = max
    return num
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '' || isNaN(Number(val))) {
      onChange?.(undefined)
    } else {
      onChange?.(parseValue(val))
    }
  }

  const handleIncrement = () => {
    if (disabled) return
    const current = typeof value === 'number' ? value : 0
    let newVal = current + step
    if (max !== undefined && newVal > max) newVal = max
    if (precision !== undefined) newVal = Number(newVal.toFixed(precision))
    onChange?.(newVal)
  }

  const handleDecrement = () => {
    if (disabled) return
    const current = typeof value === 'number' ? value : 0
    let newVal = current - step
    if (min !== undefined && newVal < min) newVal = min
    if (precision !== undefined) newVal = Number(newVal.toFixed(precision))
    onChange?.(newVal)
  }

  const canInc = !disabled && (max === undefined || (typeof value === 'number' ? value < max : true))
  const canDec = !disabled && (min === undefined || (typeof value === 'number' ? value > min : true))

  // 容器样式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    width: '100%',
    ...propsStyle,
  }

  // 输入框样式 - Ant Design 风格
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: `${token('spacingXs')} ${token('spacingSm')}`,
    paddingRight: '28px', // 给按钮留空间
    border: `1px solid ${token('borderPrimary')}`,
    borderRadius: token('borderRadiusSm') as string,
    fontSize: token('fontSizeMd') as number,
    lineHeight: '1.5',
    color: token('textPrimary') as string,
    backgroundColor: disabled ? token('disabledBg') as string : token('inputBg') as string,
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    transition: String(token('transitionAll')),
    boxSizing: 'border-box',
    ...(focused ? {
      borderColor: token('primary') as string,
      boxShadow: token('inputFocusBoxShadow') as string,
    } : {}),
    ...(disabled ? {} : {
      ':hover': {
        borderColor: token('primaryHover') as string,
      },
    }),
  }

  // 按钮组样式
  const btnGroupStyle: React.CSSProperties = {
    position: 'absolute',
    right: '1px',
    top: '1px',
    bottom: '1px',
    width: '24px',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: `1px solid ${token('borderPrimary')}`,
    borderRadius: `0 ${token('borderRadiusSm')} ${token('borderRadiusSm')} 0`,
    overflow: 'hidden',
  }

  const arrowBtnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    fontSize: '10px',
    color: token('textTertiary') as string,
    userSelect: 'none',
    transition: `color 0.2s`,
    lineHeight: 1,
  }

  return (
    <div style={containerStyle} className={className}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        id={id}
        style={inputStyle}
        onFocus={(e) => { setFocused(true); rest.onFocus?.() }}
        onBlur={(e) => { setFocused(false); rest.onBlur?.() }}
        {...rest}
      />
      <div style={btnGroupStyle}>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canInc}
          style={{
            ...arrowBtnStyle,
            opacity: !canInc ? 0.3 : 1,
          }}
          onMouseEnter={(e) => { if (canInc) (e.target as HTMLElement).style.color = token('primary') as string }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = token('textTertiary') as string }}
        >
          ▲
        </button>
        <div style={{ height: '1px', background: token('borderPrimary') as string }} />
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDec}
          style={{
            ...arrowBtnStyle,
            opacity: !canDec ? 0.3 : 1,
          }}
          onMouseEnter={(e) => { if (canDec) (e.target as HTMLElement).style.color = token('primary') as string }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = token('textTertiary') as string }}
        >
          ▼
        </button>
      </div>
    </div>
  )
}
