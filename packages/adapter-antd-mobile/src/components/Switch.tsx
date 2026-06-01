import { Switch } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const SwitchField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Switch
      checked={!!value}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    />
  )
}
