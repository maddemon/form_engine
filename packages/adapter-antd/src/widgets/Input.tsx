/**
 * Antd Input - PropertyPanel 用
 */
import { Input as AntdInput } from 'antd'
import React from 'react'

export const Input: React.FC<any> = ({ value, onChange, placeholder, disabled, variant, size = 'small', style }) => (
  <AntdInput
    value={value ?? ''}
    onChange={v => onChange?.(v.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    variant={variant}
    size={size}
    style={{ width: '100%', ...style }}
  />
)
