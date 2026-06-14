import { InputProps } from '@form-engine/core'
import { useLocale } from '@form-engine/core/locale'
import { Input as AntmInput } from 'antd-mobile'
import React from 'react'

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder: placeholderProp,
  disabled,
  readOnly,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.input ?? 'Please enter'
  return (
    <AntmInput
      value={(value as string) ?? ''}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
    />
  )
}
