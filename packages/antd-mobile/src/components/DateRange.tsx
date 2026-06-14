import type { DateRangeProps } from '@form-engine/core'
import { isTimeFormat } from '@form-engine/core/utils/date'
import { DatePicker, Space } from 'antd-mobile'
import { CalendarOutline, CloseCircleFill } from 'antd-mobile-icons'
import { useLocale } from '@form-engine/core/locale'
import React from 'react'
import { formatDate } from '../utils'

export const DateRangePicker: React.FC<DateRangeProps> = ({
  value,
  onChange,
  disabled,
  format = 'YYYY-MM-DD',
  showTime: explicitShowTime,
  allowClear,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const showTime = explicitShowTime || isTimeFormat(format)
  const vals = (value as [string, string] | null) || [null, null]
  const hasValue = !!vals[0] || !!vals[1]

  const cb = onChange as ((value: string[] | undefined) => void) | undefined

  return (
    <Space
      block
      justify="between"
      align="center"
      style={{
        color: hasValue ? undefined : 'var(--adm-color-weak)',
        ...style,
      }}
      className={className}
      id={id}
    >
      <Space gap={4} align="center">
        <DatePicker
          confirmText={locale.adapter.mobile.confirm}
          cancelText={locale.adapter.mobile.cancel}
          precision={showTime ? 'minute' : 'day'}
          value={vals[0] ? new Date(vals[0]) : undefined}
          onConfirm={(d: any) => {
            const str = d ? formatDate(d) : ''
            cb?.(str ? [str, vals[1] || ''] : [null, null])
          }}
        >
          {(v: any, actions: any) => (
            <span
              onClick={disabled ? undefined : actions.open}
              style={{ cursor: disabled ? 'default' : 'pointer' }}
            >
              {v ? formatDate(v as Date) : locale.adapter.mobile.dateRangeStart}
            </span>
          )}
        </DatePicker>
        <span>~</span>
        <DatePicker
          confirmText={locale.adapter.mobile.confirm}
          cancelText={locale.adapter.mobile.cancel}
          precision={showTime ? 'minute' : 'day'}
          value={vals[1] ? new Date(vals[1]) : undefined}
          onConfirm={(d: any) => {
            const str = d ? formatDate(d) : ''
            cb?.(str ? [vals[0] || '', str] : [null, null])
          }}
        >
          {(v: any, actions: any) => (
            <span
              onClick={disabled ? undefined : actions.open}
              style={{ cursor: disabled ? 'default' : 'pointer' }}
            >
              {v ? formatDate(v as Date) : locale.adapter.mobile.dateRangeEnd}
            </span>
          )}
        </DatePicker>
      </Space>
      {hasValue && allowClear ? (
        <CloseCircleFill
          style={{ fontSize: 16, flexShrink: 0 }}
          onClick={() => cb?.([null, null])}
        />
      ) : (
        <CalendarOutline style={{ fontSize: 16, flexShrink: 0 }} />
      )}
    </Space>
  )
}
