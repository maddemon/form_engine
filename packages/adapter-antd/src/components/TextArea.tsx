import React from 'react'
import { Input as AntdInput } from 'antd'
import { useLocale } from '@form-engine/core/locale'
import type { TextAreaProps } from '@form-engine/core'

const { TextArea: AntdTextArea } = AntdInput

/**
 * Antd TextArea 组件
 * 实现标准 TextAreaProps 接口
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder: placeholderProp,
  disabled,
  readOnly,
  rows = 4,
  autoSize,
  showCount,
  maxLength,
  style,
  className,
  id,
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.input ?? 'Please enter'
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if ((e.nativeEvent as InputEvent)?.isComposing) return
    onChange?.(e.target.value)
  }
  
  return (
    <AntdTextArea
      value={(value as string) ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      autoSize={autoSize}
      showCount={showCount}
      maxLength={maxLength}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
    />
  )
}
