import React from 'react'
import { Input as AntdInput } from 'antd'
import type { TextAreaProps } from '@form-engine/core'

const { TextArea: AntdTextArea } = AntdInput

/**
 * Antd TextArea 组件
 * 实现标准 TextAreaProps 接口
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  rows = 4,
  autoSize,
  showCount,
  maxLength,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      {...rest}
    />
  )
}
