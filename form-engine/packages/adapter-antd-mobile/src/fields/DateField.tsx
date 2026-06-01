import { DatePicker, Button, Cascader, Picker, ImageUploader } from 'antd-mobile'
import { SelectField } from './InputField'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toCascaderOptions } from '../utils'

// ============================
// Date / Datetime
// ============================
export const DateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const showTime = !!(fieldSchema.componentProps as any)?.showTime
  const placeholder = fieldSchema.placeholder || '请选择日期'

  return (
    <DatePicker
      value={value ? new Date(value as string) : undefined}
      onConfirm={(d: any) => {
        if (!d) return
        let str: string
        if (showTime) {
          str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
        } else {
          str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
        }
        onChange?.(str)
      }}
      disabled={disabled}
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

// ============================
// DateRange → 两个 DatePicker
// ============================
export const DateRangeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const placeholder = fieldSchema.placeholder || '请选择日期范围'
  const vals = (value as [string, string] | null) || [null, null]

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <DatePicker
        value={vals[0] ? new Date(vals[0]) : undefined}
        onConfirm={(d: any) => {
          const str = d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : ''
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
          const str = d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : ''
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

// ============================
// Time → Picker 模拟
// ============================
export const TimeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const placeholder = fieldSchema.placeholder || '请选择时间'

  const timeOptions: { label: string; value: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const label = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
      timeOptions.push({ label, value: label })
    }
  }

  return (
    <Picker
      columns={[timeOptions]}
      value={value ? [String(value)] : []}
      onConfirm={vals => onChange?.(vals[0])}
      disabled={disabled}
    >
      {(vals: any, actions: any) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: value ? undefined : '#999' }}
        >
          {value || placeholder}
        </Button>
      )}
    </Picker>
  )
}

// ============================
// Upload → ImageUploader
// ============================
export const UploadField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const accept = (fieldSchema.componentProps as any)?.accept as string || 'image/*'
  const maxCount = ((fieldSchema.componentProps as any)?.maxCount as number) || 5

  const fileList = ((value as string[]) || []).map((url, idx) => ({
    url,
    key: String(idx),
  }))

  return (
    <ImageUploader
      value={fileList}
      onChange={files => onChange?.(files.map(f => f.url))}
      disabled={disabled}
      accept={accept}
      maxCount={maxCount}
      showUpload={fileList.length < maxCount}
    />
  )
}

// ============================
// Cascader
// ============================
export const CascaderField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const cascaderOptions = toCascaderOptions((options || []) as OptionItem[])
  const placeholder = fieldSchema.placeholder || '请选择'
  const valArr = value ? (Array.isArray(value) ? (value as string[]).map(String) : [String(value)]) : []

  return (
    <Cascader
      options={cascaderOptions}
      value={valArr}
      onConfirm={vals => onChange?.(vals)}
      disabled={disabled}
    >
      {(vals: any, actions: any) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: vals.length ? undefined : '#999' }}
        >
          {vals.length > 0 ? vals.join(' / ') : placeholder}
        </Button>
      )}
    </Cascader>
  )
}

// ============================
// TreeSelect（降级为 Picker 单层选择）
// ============================
export const TreeSelectField: FieldRendererFn = (props: FieldComponentProps) => {
  return SelectField(props)
}
