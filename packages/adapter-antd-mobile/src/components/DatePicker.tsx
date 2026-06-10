import { DatePickerProps } from '@form-engine/core'
import { useLocale } from '@form-engine/core/locale'
import { DatePicker as AntmDatePicker, Space } from 'antd-mobile'
import { CalendarOutline, CloseCircleFill } from 'antd-mobile-icons'
import React from 'react'

function isTimeFormat(fmt: string): boolean {
  return /\b(H{1,2}|m{1,2}|s{1,2})\b/.test(fmt)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDisplayDate(d: Date, showTime: boolean): string {
  const datePart = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
  if (showTime) {
    return `${datePart} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return datePart
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled,
  format = 'YYYY-MM-DD',
  showTime: explicitShowTime,
  allowClear,
  placeholder: placeholderProp,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const showTime = explicitShowTime || isTimeFormat(format)
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.date ?? 'Select date'
  const hasValue = !!value

  return (
    <AntmDatePicker
      confirmText={locale.adapter.mobile.confirm}
      cancelText={locale.adapter.mobile.cancel}
      precision={showTime ? 'minute' : 'day'}
      value={value ? new Date(value as string) : undefined}
      onConfirm={(d: any) => {
        if (!d) return
        onChange?.(showTime ? formatDateTime(d) : formatDate(d))
      }}
    >
      {(v: any, actions: any) => (
        <Space
          block
          justify="between"
          align="center"
          onClick={disabled ? undefined : actions.open}
          style={{
            color: hasValue ? undefined : 'var(--adm-color-weak)',
            cursor: disabled ? 'default' : 'pointer',
            ...style,
          }}
          className={className}
          id={id}
        >
          <span>{v ? formatDisplayDate(v as Date, showTime) : placeholder}</span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(undefined)
              }}
            />
          ) : (
            <CalendarOutline style={{ fontSize: 16, flexShrink: 0 }} />
          )}
        </Space>
      )}
    </AntmDatePicker>
  )
}
