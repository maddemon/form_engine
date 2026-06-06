import type { FieldComponentProps, FieldRendererFn, OptionItem } from '@form-engine/core'
import { Segmented } from 'antd-mobile'

export const SegmentField: FieldRendererFn = (props: FieldComponentProps) => {
  const options: OptionItem[] = (props.options ?? []) as OptionItem[]
  const disabled = props.disabled
  const block = props.block
  const onChange = props.onChange

  const segOptions = options.map((opt) => ({
    label: opt.label,
    value: opt.value,
    disabled: opt.disabled,
  }))

  return (
    <Segmented
      value={props.value}
      defaultValue={props.defaultValue}
      options={segOptions}
      block={block}
      disabled={disabled}
      onChange={(val) => onChange?.(val)}
      style={props.style}
    />
  )
}
