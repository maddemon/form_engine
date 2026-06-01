import { InputProps } from '@form-engine/core'
import { Input as AntdInput } from 'antd'
import React from 'react'

/**
 * Antd Input 组件
 * 实现标准 InputProps 接口
 */
export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  type = 'text',
  maxLength,
  showCount,
  allowClear,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  autoComplete,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }
  
  const inputProps = {
    value: (value as string) || undefined,
    onChange: handleChange,
    placeholder,
    disabled,
    readOnly,
    maxLength,
    showCount,
    allowClear,
    prefix,
    suffix,
    addonBefore,
    addonAfter,
    autoComplete,
    style: { width: '100%', ...style },
    className,
    id,
    ...rest
  }
  
  if (type === 'password') {
    return <AntdInput {...inputProps} type="password" />
  }
  
  return (
    <AntdInput
      {...inputProps}
      type={type}
    />
  )
}

/**
 * Antd Password 组件（复用 Input）
 */
export const Password: React.FC<InputProps> = (props) => {
  return <Input {...props} type="password" />
}
