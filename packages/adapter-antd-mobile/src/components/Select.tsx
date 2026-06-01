import { Button, Picker } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toPickerColumns } from '../utils'

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
