import React, { useState } from 'react'
import type { CheckboxProps } from './types'
import { useStyle } from '../../styles/useStyle'

const CHECKBOX_SIZE = 16

/**
 * Checkbox 图标 - Ant Design 风格
 */
function CheckboxIcon({
  checked,
  indeterminate,
  disabled,
  onMouseEnter,
  onMouseLeave,
}: {
  checked: boolean
  indeterminate: boolean
  disabled: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const { token } = useStyle()
  const [hovered, setHovered] = useState(false)

  const borderColor = disabled
    ? token('borderPrimary') as string
    : checked || indeterminate
      ? token('primary') as string
      : hovered
        ? token('primaryHover') as string
        : token('borderPrimary') as string

  const bgColor = disabled
    ? token('disabledBg') as string
    : checked || indeterminate
      ? token('primary') as string
      : 'transparent'

  const textColor = disabled ? token('disabledColor') as string : '#fff'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        border: `2px solid ${borderColor}`,
        borderRadius: token('borderRadiusXs') as string,
        background: bgColor,
        transition: 'all 0.2s',
        flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={() => { setHovered(true); onMouseEnter?.() }}
      onMouseLeave={() => { setHovered(false); onMouseLeave?.() }}
    >
      {(checked || indeterminate) && (
        <svg
          viewBox="0 0 16 16"
          style={{
            width: '10px',
            height: '10px',
            fill: textColor,
          }}
        >
          {indeterminate ? (
            // 减号
            <rect x="3" y="7" width="10" height="2" rx="1" />
          ) : (
            // 勾号
            <path d="M5.5 8.5L3 11L6.5 14.5L13 4L11 2.5L6.5 10L5.5 8.5Z" />
          )}
        </svg>
      )}
    </span>
  )
}

/**
 * HTML Checkbox 组件（默认实现）
 * Ant Design 风格
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  options,
  disabled,
  indeterminate,
  style: propsStyle,
  className,
  id,
  children,
  ...rest
}) => {
  // 多选模式（有 options）
  if (options && options.length > 0) {
    const values = Array.isArray(value) ? value : []

    const handleChange = (val: any, checked: boolean) => {
      if (!disabled) {
        const newValues = checked
          ? [...values, val]
          : values.filter(v => v !== val)
        onChange?.(newValues)
      }
    }

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: token('spacingSm') as number,
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
          const checked = values.includes(opt.value)
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
                handleChange(opt.value, !checked)
              }}
            >
              <CheckboxIcon
                checked={checked}
                indeterminate={false}
                disabled={disabled || !!opt.disabled}
              />
              <span style={{ marginLeft: token('spacingXs') as number, fontSize: token('fontSizeMd') as number }}>
                {opt.label}
              </span>
            </label>
          )
        })}
      </div>
    )
  }

  // 单个 Checkbox
  const checked = !!value

  const handleChange = () => {
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  const itemStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...propsStyle,
  }

  return (
    <label
      id={id}
      className={className}
      style={itemStyle}
      onClick={(e) => { e.preventDefault(); handleChange() }}
      {...rest}
    >
      <CheckboxIcon checked={checked} indeterminate={!!indeterminate} disabled={!!disabled} />
      {children && (
        <span style={{ marginLeft: token('spacingXs') as number, fontSize: token('fontSizeMd') as number }}>
          {children}
        </span>
      )}
    </label>
  )
}

/**
 * HTML CheckboxGroup 组件（与 Checkbox 多选模式相同）
 */
export const CheckboxGroup: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} />
}

// 需要提取 token 到外层
function token(name: string): string | number {
  // 延迟导入避免循环依赖
  const { defaultTheme } = require('../../styles/defaultTheme')
  const keyMap: Record<string, keyof typeof defaultTheme> = {
    'spacingSm': 'spacingSm',
    'spacingXs': 'spacingXs',
    'fontSizeMd': 'fontSizeMd',
    'borderRadiusXs': 'borderRadiusXs',
    'primary': 'primary',
    'primaryHover': 'primaryHover',
    'borderPrimary': 'borderPrimary',
    'disabledBg': 'disabledBg',
    'disabledColor': 'disabledColor',
  }
  return defaultTheme[keyMap[name] as keyof typeof defaultTheme] as any
}
