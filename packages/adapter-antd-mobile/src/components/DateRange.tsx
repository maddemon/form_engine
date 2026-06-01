import { DatePicker, Button } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const DateRangeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const placeholder = fieldSchema.placeholder || '请选择日期范围'
  const vals = (value as [string, string] | null) || [null, null]

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <DatePicker
        value={vals[0] ? new Date(vals[0]) : undefined}
        onConfirm={(d: any) => {
          const str = d ? formatDate(d) : ''
          onChange?.(str ? [str, vals[1] || ''] : [null, null])
        }}
        disabled={disabled}
      >
        {(v: any, actions: any) => (
          <Button onClick={actions.open} disabled={disabled} size="small">
            {v ? (v as Date).toLocaleDateString() : '开始'}
          </Button>
        )}
      </DatePicker>
      <span>~</span>
      <DatePicker
        value={vals[1] ? new Date(vals[1]) : undefined}
        onConfirm={(d: any) => {
          const str = d ? formatDate(d) : ''
          onChange?.(str ? [vals[0] || '', str] : [null, null])
        }}
        disabled={disabled}
      >
        {(v: any, actions: any) => (
          <Button onClick={actions.open} disabled={disabled} size="small">
            {v ? (v as Date).toLocaleDateString() : '结束'}
          </Button>
        )}
      </DatePicker>
    </div>
  )
}
