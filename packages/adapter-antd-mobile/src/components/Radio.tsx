import { Radio, Selector, Space } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const RadioField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const radioOptions = (options || []) as OptionItem[]
  const direction = fieldSchema.componentProps?.direction as string | undefined
  const optionType = fieldSchema.componentProps?.optionType as string | undefined

  // 按钮风格 → 使用 Selector 实现
  if (optionType === 'button') {
    return (
      <Selector
        options={radioOptions.map(opt => ({ label: opt.label, value: opt.value, disabled: opt.disabled }))}
        value={value != null ? [value] : []}
        onChange={v => onChange?.(v[0] ?? undefined)}
        disabled={disabled}
        multiple={false}
      />
    )
  }

  return (
    <Radio.Group
      value={value as string}
      onChange={v => onChange?.(v)}
      disabled={disabled}
    >
      <Space direction={direction === 'vertical' ? 'vertical' : 'horizontal'} block>
        {radioOptions.map(opt => (
          <Radio key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  )
}
