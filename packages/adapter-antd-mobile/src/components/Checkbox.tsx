import { Checkbox, Space } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const CheckboxField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const checkboxOptions = (options || []) as OptionItem[]
  const direction = (fieldSchema.componentProps as any)?.direction

  if (checkboxOptions.length > 0) {
    const vals = (value as string[]) || []
    return (
      <Checkbox.Group
        value={vals}
        onChange={v => onChange?.(v)}
        disabled={disabled}
      >
        <Space direction={direction === 'vertical' ? 'vertical' : 'horizontal'} block>
          {checkboxOptions.map(opt => (
            <Checkbox key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </Checkbox>
          ))}
        </Space>
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
