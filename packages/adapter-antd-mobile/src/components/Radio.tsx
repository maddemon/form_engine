import { Radio, Space } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const RadioField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const radioOptions = (options || []) as OptionItem[]
  const direction = (fieldSchema.componentProps as any)?.direction
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
