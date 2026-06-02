import { DatePicker, Button } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const DateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const showTime = !!(fieldSchema.componentProps as any)?.showTime
  const placeholder = fieldSchema.placeholder || '请选择日期'

  return (
    <DatePicker
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
          {v ? (v as Date).toLocaleDateString() : placeholder}
        </Button>
      )}
    </DatePicker>
  )
}
