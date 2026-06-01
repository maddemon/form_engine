import { Button, Cascader } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toCascaderOptions } from '../utils'

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
