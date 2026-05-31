import { Input } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'

const { Password } = Input

/**
 * input 类型：普通文本输入
 */
export const InputField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <Input
      value={(value as string) ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}

/**
 * password 类型：密码输入
 */
export const PasswordField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, readOnly, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <Password
      value={(value as string) ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}
