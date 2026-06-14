import { TextAreaProps } from '@form-engine/core'
import { useLocale } from '@form-engine/core/locale'
import { TextArea as AntmTextArea } from 'antd-mobile'
import React from 'react'

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder: placeholderProp,
  disabled,
  readOnly,
  rows,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.input ?? 'Please enter'
  return (
    <AntmTextArea
      value={(value as string) ?? ''}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      rows={rows}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
    />
  )
}
