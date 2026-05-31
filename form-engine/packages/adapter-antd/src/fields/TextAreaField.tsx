import { Input } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'

const { TextArea } = Input

export const TextAreaField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <TextArea
      value={(value as string) ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}
