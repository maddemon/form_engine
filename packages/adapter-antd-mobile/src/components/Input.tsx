import { Input } from 'antd-mobile'
import { useLocale } from '@form-engine/core/locale'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const InputField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  const { locale } = useLocale()
  return (
    <Input
      value={(value as string) ?? ''}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder ?? locale.adapter.common.placeholder.input ?? 'Please enter'}
      style={{ width: '100%' }}
    />
  )
}
