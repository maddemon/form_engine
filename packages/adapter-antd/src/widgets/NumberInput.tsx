/**
 * Antd InputNumber - PropertyPanel 用
 */
import { InputNumber as AntdInputNumber } from 'antd'
import React from 'react'

export const NumberInput: React.FC<any> = ({ value, onChange, min, max, disabled, style }) => (
  <AntdInputNumber
    value={value}
    onChange={v => onChange?.(v)}
    min={min}
    max={max}
    disabled={disabled}
    size="small"
    style={{ width: '100%', ...style }}
  />
)
