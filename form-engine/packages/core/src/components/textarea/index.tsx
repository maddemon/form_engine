import React from 'react'
import type { TextAreaProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML TextArea 组件（默认实现）
 *
 * 使用主题 Token，支持通过 CSS 变量或 StyleProvider 自定义样式
 */
export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
  rows = 4,
  maxLength,
  showCount,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  const currentLength = (value as string)?.length || 0

  // 使用主题 Token
  const { mergeStyle } = useStyle()

  // 基础样式 - 使用主题 Token
  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    background: disabled ? '#f5f5f5' : '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    color: 'rgba(0, 0, 0, 0.88)',
    fontSize: '14px',
    lineHeight: '1.5',
    cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    ...propsStyle,
  }

  // 字符计数样式
  const countStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    bottom: '8px',
    color: 'rgba(0, 0, 0, 0.25)',
    fontSize: '12px',
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <textarea
        value={(value as string) || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        id={id}
        className={className}
        style={textareaStyle}
        {...rest}
      />
      {showCount && maxLength && (
        <span style={countStyle}>
          {currentLength}/{maxLength}
        </span>
      )}
    </div>
  )
}
