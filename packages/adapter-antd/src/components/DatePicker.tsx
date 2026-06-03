/**
 * Antd DatePicker 组件
 * 适配 Form Engine 的 DatePickerProps 和 DateRangeProps
 */

import dayjs from 'dayjs'
import React from 'react'
import { DatePicker as AntDatePicker, TimePicker as AntTimePicker } from 'antd'
import type { DatePickerProps, DateRangeProps } from '@form-engine/core'

const { RangePicker } = AntDatePicker

function toDayjs(value: string | undefined): dayjs.Dayjs | undefined {
  return value ? dayjs(value) : undefined
}

/** TimePicker 的值是纯时间字符串，需拼接固定日期才能生成有效 dayjs */
function toTimeDayjs(value: string | undefined): dayjs.Dayjs | undefined {
  return value ? dayjs(`2000-01-01 ${value}`) : undefined
}

function toDayjsRange(value: [string, string] | undefined): [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined {
  if (!value) return undefined
  const v0 = value[0] ? dayjs(value[0]) : null
  const v1 = value[1] ? dayjs(value[1]) : null
  if (!v0 && !v1) return undefined
  return [v0, v1]
}

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

  const resolvedDisabledDate = disabledDate
    ? (current: dayjs.Dayjs) => disabledDate(current.format(format))
    : undefined

  return (
    <AntDatePicker
      value={toDayjs(value)}
      onChange={handleChange}
      format={format}
      showTime={showTime}
      picker={picker}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      disabledDate={resolvedDisabledDate}
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

  const resolvedDisabledDate = disabledDate
    ? (current: dayjs.Dayjs) => disabledDate(current.format(format))
    : undefined

  return (
    <RangePicker
      value={toDayjsRange(value as [string, string] | undefined)}
      onChange={handleChange}
      format={format}
      showTime={showTime}
      picker={picker}
      placeholder={placeholder as [string, string]}
      allowClear={allowClear}
      disabled={disabled}
      disabledDate={resolvedDisabledDate}
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
      value={toTimeDayjs(value)}
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
