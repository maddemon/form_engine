import { Input } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

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
