import { Rate } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const RateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Rate
      value={(value as number) ?? 0}
      onChange={v => onChange?.(v)}
      readOnly={disabled}
    />
  )
}
