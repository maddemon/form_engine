import { Checkbox, Selector, Space } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const CheckboxField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const checkboxOptions = (options || []) as OptionItem[]
  const optionType = fieldSchema.componentProps?.optionType as string | undefined

  if (checkboxOptions.length > 0) {
    // 按钮风格 → 使用 Selector 实现多选
    if (optionType === 'button') {
      return (
        <Selector
          options={checkboxOptions.map(opt => ({ label: opt.label, value: opt.value, disabled: opt.disabled }))}
          value={(value as string[]) || []}
          onChange={v => onChange?.(v)}
          disabled={disabled}
          multiple={true}
        />
      )
    }

    const vals = (value as string[]) || []
    return (
      <Checkbox.Group
        value={vals}
        onChange={v => onChange?.(v)}
        disabled={disabled}
      >
        <Space direction="horizontal" block wrap>
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
