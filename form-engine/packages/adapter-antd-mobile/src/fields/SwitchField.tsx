import { Radio, Checkbox, Switch, Slider, Rate } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'


// ============================
// Radio
// ============================
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

// ============================
// Checkbox
// ============================
export const CheckboxField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const checkboxOptions = (options || []) as OptionItem[]

  if (checkboxOptions.length > 0) {
    const vals = (value as string[]) || []
    return (
      <Checkbox.Group
        value={vals}
        onChange={v => onChange?.(v)}
        disabled={disabled}
      >
        {checkboxOptions.map(opt => (
          <Checkbox key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
    )
  }

  return (
    <Checkbox
      checked={!!value}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    >
      {fieldSchema.label}
    </Checkbox>
  )
}

// ============================
// Switch
// ============================
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

// ============================
// Slider
// ============================
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

// ============================
// Rate
// ============================
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
