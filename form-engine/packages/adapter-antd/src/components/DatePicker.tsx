/**
 * Antd DatePicker 组件
 * 适配 Form Engine 的 DatePickerProps 和 DateRangeProps
 */

import React from 'react'
import { DatePicker as AntDatePicker, TimePicker as AntTimePicker } from 'antd'
import type { DatePickerProps, DateRangeProps } from '@form-engine/core'

const { RangePicker } = AntDatePicker

/**
 * DatePicker 组件
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  showTime,
  picker = 'date',
  placeholder,
  allowClear = true,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (date: any, dateString: string) => {
    onChange?.(dateString || undefined)
  }
  
  return (
    <AntDatePicker
      value={value ? (typeof value === 'string' ? value : undefined) : undefined}
      onChange={handleChange}
      format={format}
      showTime={showTime}
      picker={picker}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      disabledDate={disabledDate as any}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
    />
  )
}

/**
 * DateRangePicker 组件
 */
export const DateRangePicker: React.FC<DateRangeProps> = ({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  showTime,
  picker = 'date',
  placeholder,
  allowClear = true,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (dates: any, dateStrings: [string, string]) => {
    onChange?.(dateStrings || undefined)
  }
  
  return (
    <RangePicker
      value={value ? (value as [string, string]) : undefined}
      onChange={handleChange}
      format={format}
      showTime={showTime}
      picker={picker}
      placeholder={placeholder as [string, string]}
      allowClear={allowClear}
      disabled={disabled}
      disabledDate={disabledDate as any}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
    />
  )
}

/**
 * TimePicker 组件
 */
export const TimePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  format = 'HH:mm:ss',
  placeholder,
  allowClear = true,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (time: any, timeString: string) => {
    onChange?.(timeString || undefined)
  }
  
  return (
    <AntTimePicker
      value={value ? (typeof value === 'string' ? value : undefined) : undefined}
      onChange={handleChange}
      format={format}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
    />
  )
}
