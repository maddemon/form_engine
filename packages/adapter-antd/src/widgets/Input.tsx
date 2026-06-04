/**
 * Antd Input - PropertyPanel 用
 */
import { Input as AntdInput } from 'antd'
import React from 'react'

export const Input: React.FC<any> = ({ value, onChange, placeholder, disabled, style }) => (
  <AntdInput
    value={value ?? ''}
    onChange={v => onChange?.(v.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    size="small"
    style={{ width: '100%', ...style }}
  />
)
