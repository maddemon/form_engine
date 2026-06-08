/**
 * Antd DatePicker 组件
 * 适配 Form Engine 的 DatePickerProps 和 DateRangeProps
 */

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import React from 'react'
import { DatePicker as AntDatePicker, TimePicker as AntTimePicker } from 'antd'
import zhCN from 'antd/es/date-picker/locale/zh_CN'
import enUS from 'antd/es/date-picker/locale/en_US'
import { useLocale } from '@form-engine/core/locale'
import type { DatePickerProps, DateRangeProps } from '@form-engine/core'

const { RangePicker } = AntDatePicker

/** 根据 format 字符串自动判断是否包含时间部分 */
function isTimeFormat(fmt: string): boolean {
  return /\b(H{1,2}|m{1,2}|s{1,2})\b/.test(fmt)
}

function toDayjs(value: string | undefined): dayjs.Dayjs | null {
  return value ? dayjs(value) : null
}

/** TimePicker 的值是纯时间字符串，需拼接固定日期才能生成有效 dayjs */
function toTimeDayjs(value: string | undefined): dayjs.Dayjs | null {
  return value ? dayjs(`2000-01-01 ${value}`) : null
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
function useAntdLocale() {
  const { locale } = useLocale()
  const isChinese = locale.adapter.common.placeholder.input === '请填写'
  React.useEffect(() => {
    dayjs.locale(isChinese ? 'zh-cn' : 'en')
  }, [isChinese])
  return isChinese ? zhCN : enUS
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  format = 'YYYY-MM-DD',
  showTime: explicitShowTime,
  picker = 'date',
  placeholder: placeholderProp,
  allowClear,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const { locale } = useLocale()
  const antdLocale = useAntdLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.date ?? 'Select date'
  const showTime = explicitShowTime ?? isTimeFormat(format)
  const handleChange = (_date: dayjs.Dayjs | null, dateString: string | null) => {
    onChange?.(dateString || undefined)
  }

  const resolvedDisabledDate = disabledDate
    ? (current: dayjs.Dayjs) => disabledDate(current.format(format))
    : undefined

  return (
    <AntDatePicker
      locale={antdLocale}
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
  placeholder: placeholderProp,
  allowClear,
  disabled,
  disabledDate,
  style,
  className,
  id,
  ...rest
}) => {
  const { locale } = useLocale()
  const antdLocale = useAntdLocale()
  const placeholder = placeholderProp ?? (locale.adapter.common.placeholder.date ?? 'Select date') as unknown as [string, string]
  const showTime = explicitShowTime ?? isTimeFormat(format)
  const handleChange = (_dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateStrings: [string, string]) => {
    const cb = onChange as ((value: string[] | undefined) => void) | undefined
    cb?.(dateStrings || undefined)
  }

  const resolvedDisabledDate = disabledDate
    ? (current: dayjs.Dayjs) => disabledDate(current.format(format))
    : undefined

  return (
    <RangePicker
      locale={antdLocale}
      value={toDayjsRange(value as [string, string] | undefined)}
      onChange={handleChange}
      format={format}
      showTime={showTime}
      picker={picker}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled as boolean | undefined}
      disabledDate={resolvedDisabledDate}
      style={{ width: '100%', ...(style as React.CSSProperties | undefined) }}
      className={className as string | undefined}
      id={id as string | undefined}
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
  placeholder: placeholderProp,
  allowClear,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.time ?? 'Select time'
  const handleChange = (_time: dayjs.Dayjs | null, timeString: string | null) => {
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
    />
  )
}
