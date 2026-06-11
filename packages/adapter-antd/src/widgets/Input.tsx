/**
 * Antd Input - PropertyPanel 用
 */
import { Input as AntdInput } from 'antd'
import React from 'react'
import type { DesignerWidgets } from '@form-engine/core'

type InputProps = React.ComponentProps<DesignerWidgets['Input']>

export const Input: React.FC<InputProps> = ({ value, onChange, placeholder, disabled, variant, size = 'small', style }) => (
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
