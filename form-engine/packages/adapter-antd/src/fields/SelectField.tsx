import { Select } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'
import type { OptionItem } from '../../../types/schema'

export const SelectField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const style = (props as any).style as React.CSSProperties | undefined
  const selectOptions = (options || []) as OptionItem[]
  const isMultiple = fieldSchema.componentProps?.mode === 'multiple'

  return (
    <Select
      value={value as string | string[] ?? undefined}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      mode={isMultiple ? 'multiple' : undefined}
      allowClear
      style={{ width: '100%', ...(style || {}) }}
    >
      {selectOptions.map(opt => (
        <Select.Option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  )
}
