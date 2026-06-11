/**
 * Antd Select - PropertyPanel 用
 */
import { Select as AntdSelect } from 'antd'
import React from 'react'
import type { DesignerWidgets } from '@form-engine/core'

type SelectProps = React.ComponentProps<DesignerWidgets['Select']>

export const Select: React.FC<SelectProps> = ({ value, onChange, options, disabled, style }) => (
  <AntdSelect
    value={value}
    onChange={(v) => onChange?.(v)}
    options={options}
    disabled={disabled}
    size="small"
    allowClear
    style={{ width: '100%', ...style }}
  />
)
