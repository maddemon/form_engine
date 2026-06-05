/**
 * Antd DatePicker 组件
 * 适配 Form Engine 的 DatePickerProps 和 DateRangeProps
 */

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import React from 'react'
import { DatePicker as AntDatePicker, TimePicker as AntTimePicker } from 'antd'
import zhCN from 'antd/es/date-picker/locale/zh_CN'
import type { DatePickerProps, DateRangeProps } from '@form-engine/core'

const { RangePicker } = AntDatePicker

dayjs.locale('zh-cn')

/** 根据 format 字符串自动判断是否包含时间部分 */
function isTimeFormat(fmt: string): boolean {
  return /\b(H{1,2}|m{1,2}|s{1,2})\b/.test(fmt)
}

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
  showTime: explicitShowTime,
  picker = 'date',
  placeholder,
  allowClear,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const showTime = explicitShowTime ?? isTimeFormat(format)
  const handleChange = (_date: dayjs.Dayjs | null, dateString: string) => {
    onChange?.(dateString || undefined)
  }

  const resolvedDisabledDate = disabledDate
    ? (current: dayjs.Dayjs) => disabledDate(current.format(format))
    : undefined

  return (
    <AntDatePicker
      locale={zhCN}
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
  showTime: explicitShowTime,
  picker = 'date',
  placeholder,
  allowClear,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const showTime = explicitShowTime ?? isTimeFormat(format)
  const handleChange = (_dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => {
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
  format = 'HH:mm',
  placeholder,
  allowClear,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (_time: dayjs.Dayjs | null, timeString: string) => {
    onChange?.(timeString || undefined)
  }

  // 根据 format 推导列的显隐：format 不含秒则隐藏秒列
  const resolvedFormat = format || 'HH:mm'
  const showSecond = resolvedFormat.includes('ss') || resolvedFormat.includes('s')

  return (
    <AntTimePicker
      locale={zhCN}
      value={toTimeDayjs(value)}
      onChange={handleChange}
      format={resolvedFormat}
      showSecond={showSecond}
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
