import React, { useState } from 'react'
import type { DatePickerProps, DateRangeProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML DatePicker 组件（默认实现）
 * Ant Design 风格
 */
export const DatePicker = (props: DatePickerProps) => {
  const {
    value,
    onChange,
    placeholder = '请选择日期',
    disabled,
    showTime = false,
    style: propsStyle,
    className,
    id,
    ...rest
  } = props

  const [focused, setFocused] = useState(false)
  const { token } = useStyle()

  const inputType = showTime ? 'datetime-local' : 'date'

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: `${token('spacingXs')} ${token('spacingSm')}`,
    border: `1px solid ${token('borderPrimary')}`,
    borderRadius: token('borderRadiusSm') as string,
    fontSize: token('fontSizeMd') as number,
    lineHeight: 1.5,
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
    ...propsStyle,
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.(e.target.value || null)
    }
  }

  // 分离 HTML 兼容属性和自定义属性
  const { format, picker, showTime: showTimeProp, disabledDate, allowClear: allowClearProp, placement, ...htmlRest } = rest as any

  return (
    <input
      type={inputType}
      value={(value as string) || ''}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      className={className}
      style={inputStyle}
      onFocus={() => { setFocused(true); (rest as any).onFocus?.() }}
      onBlur={() => { setFocused(false); (rest as any).onBlur?.() }}
      {...htmlRest}
    />
  )
}

/**
 * HTML DateRangePicker 组件（默认实现）
 * Ant Design 风格 - 使用两个 date input
 */
export const DateRangePicker = (props: DateRangeProps) => {
  const {
    value,
    onChange,
    placeholder = '请选择日期范围',
    disabled,
    showTime = false,
    style: propsStyle,
    className,
    id,
    ...rest
  } = props

  const values = Array.isArray(value) ? value : [undefined, undefined]
  const { token } = useStyle()

  const inputType = showTime ? 'datetime-local' : 'date'

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: `${token('spacingXs')} ${token('spacingSm')}`,
    border: `1px solid ${token('borderPrimary')}`,
    borderRadius: token('borderRadiusSm') as string,
    fontSize: token('fontSizeMd') as number,
    color: token('textPrimary') as string,
    backgroundColor: disabled ? token('disabledBg') as string : token('inputBg') as string,
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.([e.target.value, values[1] || ''])
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange?.([values[0] || '', e.target.value])
    }
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: token('spacingSm') as number,
    alignItems: 'center',
    ...propsStyle,
  }

  // 分离 HTML 兼容属性
  const { format, showTime: showTimeProp, disabledDate, startPlaceholder, endPlaceholder, allowClear: allowClearProp, ...htmlRest } = rest as any

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...htmlRest}
    >
      <input
        type={inputType}
        value={values[0] || ''}
        onChange={handleStartChange}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
      <span style={{ color: token('textTertiary') as string }}>至</span>
      <input
        type={inputType}
        value={values[1] || ''}
        onChange={handleEndChange}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyle}
      />
    </div>
  )
}
