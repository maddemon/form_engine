/**
 * Antd InputNumber - PropertyPanel 用
 */
import { InputNumber as AntdInputNumber } from 'antd'
import React from 'react'
import type { DesignerWidgets } from '@form-engine/core'

type NumberInputProps = React.ComponentProps<DesignerWidgets['NumberInput']>

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, min, max, disabled, variant, size = 'small', style }) => (
  <AntdInputNumber
    value={value}
    onChange={(v) => onChange?.(v ?? 0)}
    min={min}
    max={max}
    disabled={disabled}
    variant={variant}
    size={size}
    style={{ width: '100%', ...style }}
  />
)
