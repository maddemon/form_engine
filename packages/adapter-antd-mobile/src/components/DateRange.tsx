import { DatePicker, Space } from 'antd-mobile'
import { CalendarOutline, CloseCircleFill } from 'antd-mobile-icons'
import { useLocale } from '@form-engine/core/locale'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

/** 根据 format 字符串自动判断是否包含时间部分 */
function isTimeFormat(fmt: string): boolean {
  return /\b(H{1,2}|m{1,2}|s{1,2})\b/.test(fmt)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const DateRangeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const { locale } = useLocale()
  const format = fieldSchema.componentProps?.format as string || 'YYYY-MM-DD'
  const showTime = !!fieldSchema.componentProps?.showTime || isTimeFormat(format)
  const placeholder = fieldSchema.placeholder ?? locale.adapter.common.placeholder.date ?? 'Select date'
  const allowClear = fieldSchema.componentProps?.allowClear
  const vals = (value as [string, string] | null) || [null, null]
  const hasValue = !!vals[0] || !!vals[1]

  return (
    <Space
      block
      justify="between"
      align="center"
      style={{
        color: hasValue ? undefined : 'var(--adm-color-weak)',
      }}
    >
      <Space gap={4} align="center">
        <DatePicker
          confirmText={locale.adapter.mobile.confirm}
          cancelText={locale.adapter.mobile.cancel}
          precision={showTime ? 'minute' : 'day'}
          value={vals[0] ? new Date(vals[0]) : undefined}
          onConfirm={(d: any) => {
            const str = d ? formatDate(d) : ''
            onChange?.(str ? [str, vals[1] || ''] : [null, null])
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
            onChange?.(str ? [vals[0] || '', str] : [null, null])
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
          onClick={() => onChange?.([null, null])}
        />
      ) : (
        <CalendarOutline style={{ fontSize: 16, flexShrink: 0 }} />
      )}
    </Space>
  )
}
