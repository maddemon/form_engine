import React from 'react'
import type { SelectProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Select 组件（默认实现）
 *
 * 使用主题 Token，支持通过 CSS 变量或 StyleProvider 自定义样式
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  mode,
  allowClear,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const isMultiple = mode === 'multiple' || mode === 'tags'

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isMultiple) {
      const selected = Array.from(e.target.selectedOptions, option => option.value)
      onChange?.(selected)
    } else {
      onChange?.(e.target.value)
    }
  }

  const handleClear = () => {
    onChange?.(isMultiple ? [] : '')
  }

  // 使用主题 Token
  const { mergeStyle } = useStyle()

  // 基础样式 - 使用主题 Token
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    paddingRight: allowClear && value ? '24px' : undefined,
    background: disabled ? '#f5f5f5' : '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    color: 'rgba(0, 0, 0, 0.88)',
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    boxSizing: 'border-box',
    ...propsStyle,
  }

  // 清除按钮样式
  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: 'rgba(0, 0, 0, 0.25)',
    fontSize: '20px',
    lineHeight: 1,
    userSelect: 'none',
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        value={value as any}
        onChange={handleChange}
        disabled={disabled}
        multiple={isMultiple}
        id={id}
        className={className}
        style={selectStyle}
        {...rest}
      >
        {!isMultiple && <option value="">{placeholder || '请选择'}</option>}
        {options.map(opt => (
          <option key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {allowClear && value && (
        <span
          onClick={handleClear}
          style={clearButtonStyle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClear()
            }
          }}
        >
          ×
        </span>
      )}
    </div>
  )
}
