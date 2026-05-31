import { Switch, Radio, Checkbox, Slider, Rate } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'
import type { OptionItem } from '../../../types/schema'

// ----- Radio -----
export const RadioField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const radioOptions = (options || []) as OptionItem[]
  return (
    <Radio.Group
      value={value as string}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
    >
      {radioOptions.map(opt => (
        <Radio key={String(opt.value)} value={String(opt.value)}>{opt.label}</Radio>
      ))}
    </Radio.Group>
  )
}

// ----- Checkbox -----
export const CheckboxField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const checkboxOptions = (options || []) as OptionItem[]

  if (checkboxOptions.length > 0 && !fieldSchema.componentProps?.isSingle) {
    const vals = (value as string[]) || []
    return (
      <Checkbox.Group
        value={vals}
        onChange={v => onChange?.(v)}
        disabled={disabled}
      >
        {checkboxOptions.map(opt => (
          <Checkbox key={String(opt.value)} value={String(opt.value)}>{opt.label}</Checkbox>
        ))}
      </Checkbox.Group>
    )
  }

  return (
    <Checkbox
      checked={!!value}
      onChange={e => onChange?.(e.target.checked)}
      disabled={disabled}
    >
      {fieldSchema.label}
    </Checkbox>
  )
}

// ----- Switch -----
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

// ----- Slider -----
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

// ----- Rate -----
export const RateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled } = props
  return (
    <Rate
      value={(value as number) ?? 0}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    />
  )
}
