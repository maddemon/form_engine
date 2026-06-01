import { Input, Picker, Radio, Checkbox, Switch, Slider, Rate, DatePicker, ImageUploader, Cascader, Stepper, Button, TextArea } from 'antd-mobile'
import type { OptionItem } from '@form-engine/core'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toPickerColumns } from '../utils'

// ============================
// Input
// ============================
export const InputField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  return (
    <Input
      value={(value as string) ?? ''}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%' }}
    />
  )
}

// ============================
// TextArea
// ============================
export const TextAreaField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  return (
    <TextArea
      value={(value as string) ?? ''}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%' }}
    />
  )
}

// ============================
// InputNumber → Stepper
// ============================
export const InputNumberField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Stepper
      value={(value as number) ?? 0}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      style={{ width: '100%' }}
    />
  )
}

// ============================
// Password → Input type=password
// ============================
export const PasswordField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  return (
    <Input
      type="password"
      value={(value as string) ?? ''}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%' }}
    />
  )
}

// ============================
// Select → Picker
// ============================
export const SelectField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const opts = (options || []) as OptionItem[]
  const columns = toPickerColumns(opts)
  const isMulti = (fieldSchema.componentProps as any)?.mode === 'multiple'
  const placeholder = fieldSchema.placeholder || '请选择'

  const valArr = isMulti
    ? ((value as string[]) || []).map(String)
    : (value ? [String(value)] : [])

  return (
    <Picker
      columns={columns}
      value={valArr}
      onConfirm={vals => {
        if (isMulti) {
          onChange?.(vals)
        } else {
          onChange?.(vals[0] || undefined)
        }
      }}
      disabled={disabled}
    >
      {(vals, actions) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: vals.length ? undefined : '#999' }}
        >
          {vals.length > 0
            ? vals.map(v => opts.find(o => String(o.value) === v)?.label || v).join('，')
            : placeholder}
        </Button>
      )}
    </Picker>
  )
}
