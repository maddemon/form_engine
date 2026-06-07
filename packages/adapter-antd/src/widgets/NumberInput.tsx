/**
 * Antd InputNumber - PropertyPanel 用
 */
import { InputNumber as AntdInputNumber } from 'antd'
import React from 'react'

export const NumberInput: React.FC<any> = ({ value, onChange, min, max, disabled, step, variant, size = 'small', style }) => (
  <AntdInputNumber
    value={value}
    onChange={(v) => onChange?.(v)}
    min={min}
    max={max}
    disabled={disabled}
    step={step}
    variant={variant}
    size={size}
    style={{ width: '100%', ...style }}
  />
)
