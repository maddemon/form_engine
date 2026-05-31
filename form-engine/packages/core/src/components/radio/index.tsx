import React, { useState } from 'react'
import type { RadioProps } from './types'
import { useStyle } from '../../styles/useStyle'

const RADIO_SIZE = 16

/**
 * Radio 图标 - Ant Design 风格
 */
function RadioIcon({
  checked,
  disabled,
}: {
  checked: boolean
  disabled: boolean
}) {
  const { token } = useStyle()
  const [hovered, setHovered] = useState(false)

  const borderColor = disabled
    ? token('borderPrimary') as string
    : checked
      ? token('primary') as string
      : hovered
        ? token('primaryHover') as string
        : token('borderPrimary') as string

  const dotColor = checked ? token('primary') as string : 'transparent'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: RADIO_SIZE,
        height: RADIO_SIZE,
        border: `2px solid ${borderColor}`,
        borderRadius: '50%',
        background: disabled ? token('disabledBg') as string : token('bgPrimary') as string,
        transition: 'all 0.2s',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {checked && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dotColor,
            transition: 'all 0.2s',
          }}
        />
      )}
    </span>
  )
}

/**
 * HTML Radio 组件（默认实现）
 * Ant Design 风格
 */
export const Radio: React.FC<RadioProps> = ({
  value,
  onChange,
  options = [],
  disabled,
  style: propsStyle,
  className,
  id,
  children,
  ...rest
}) => {
  const handleChange = (val: any) => {
    if (!disabled) {
      onChange?.(val)
    }
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...propsStyle,
  }

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...rest}
    >
      {options.map(opt => {
        const checked = value === opt.value
        return (
          <label
            key={opt.value}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: (disabled || opt.disabled) ? 'not-allowed' : 'pointer',
              opacity: (disabled || opt.disabled) ? 0.5 : 1,
            }}
            onClick={(e) => {
              e.preventDefault()
              handleChange(opt.value)
            }}
          >
            <RadioIcon
              checked={checked}
              disabled={disabled || !!opt.disabled}
            />
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>
              {opt.label}
            </span>
          </label>
        )
      })}
      {/* 如果没有 options 但有 children，渲染单个 Radio */}
      {options.length === 0 && children && (
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
          }}
          onClick={(e) => {
            e.preventDefault()
            handleChange(value)
          }}
        >
          <RadioIcon checked={!!value} disabled={!!disabled} />
          <span style={{ marginLeft: '8px', fontSize: '14px' }}>
            {children}
          </span>
        </label>
      )}
    </div>
  )
}

/**
 * HTML RadioGroup 组件（与 Radio 相同实现）
 */
export const RadioGroup: React.FC<RadioProps> = (props) => {
  return <Radio {...props} />
}
