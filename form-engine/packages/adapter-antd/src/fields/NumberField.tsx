import { InputNumber } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'

export const InputNumberField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <InputNumber
      value={(value as number) ?? undefined}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}
