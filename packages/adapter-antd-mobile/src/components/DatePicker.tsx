import { DatePicker, Button } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

/** 根据 format 字符串自动判断是否包含时间部分 */
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

export const DateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const format = fieldSchema.componentProps?.format as string || 'YYYY-MM-DD'
  const explicitShowTime = !!fieldSchema.componentProps?.showTime
  const showTime = explicitShowTime || isTimeFormat(format)
  const placeholder = fieldSchema.placeholder || '请选择日期'

  return (
    <DatePicker
      confirmText="确定"
      cancelText="取消"
      precision={showTime ? 'minute' : 'day'}
      value={value ? new Date(value as string) : undefined}
      onConfirm={(d: any) => {
        if (!d) return
        onChange?.(showTime ? formatDateTime(d) : formatDate(d))
      }}
    >
      {(v: any, actions: any) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: v ? undefined : '#999' }}
        >
          {v ? formatDisplayDate(v as Date, showTime) : placeholder}
        </Button>
      )}
    </DatePicker>
  )
}
