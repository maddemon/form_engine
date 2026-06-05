import { DatePicker, Button } from 'antd-mobile'
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
  const format = fieldSchema.componentProps?.format as string || 'YYYY-MM-DD'
  const showTime = !!fieldSchema.componentProps?.showTime || isTimeFormat(format)
  const placeholder = fieldSchema.placeholder || '请选择日期范围'
  const vals = (value as [string, string] | null) || [null, null]

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <DatePicker
        confirmText="确定"
        cancelText="取消"
        precision={showTime ? 'minute' : 'day'}
        value={vals[0] ? new Date(vals[0]) : undefined}
        onConfirm={(d: any) => {
          const str = d ? formatDate(d) : ''
          onChange?.(str ? [str, vals[1] || ''] : [null, null])
        }}
      >
        {(v: any, actions: any) => (
          <Button onClick={actions.open} disabled={disabled} size="small">
            {v ? (v as Date).toLocaleDateString() : '开始'}
          </Button>
        )}
      </DatePicker>
      <span>~</span>
      <DatePicker
        confirmText="确定"
        cancelText="取消"
        precision={showTime ? 'minute' : 'day'}
        value={vals[1] ? new Date(vals[1]) : undefined}
        onConfirm={(d: any) => {
          const str = d ? formatDate(d) : ''
          onChange?.(str ? [vals[0] || '', str] : [null, null])
        }}
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
