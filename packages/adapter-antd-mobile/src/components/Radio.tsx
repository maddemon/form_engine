import { Radio } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const RadioField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, options } = props
  const radioOptions = (options || []) as OptionItem[]
  return (
    <Radio.Group
      value={value as string}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    >
      {radioOptions.map(opt => (
        <Radio key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </Radio>
      ))}
    </Radio.Group>
  )
}
