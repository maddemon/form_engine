import { Slider } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const SliderField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Slider
      value={(value as number) ?? 0}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    />
  )
}
