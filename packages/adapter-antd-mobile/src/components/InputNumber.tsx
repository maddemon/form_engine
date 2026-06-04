import { Stepper } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const InputNumberField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Stepper
      value={(value as number) ?? 0}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      style={{}}
    />
  )
}
