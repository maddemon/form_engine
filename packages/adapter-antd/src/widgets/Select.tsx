/**
 * Antd Select - PropertyPanel 用
 */
import { Select as AntdSelect } from 'antd'
import React from 'react'

export const Select: React.FC<any> = ({ value, onChange, options, disabled, style }) => <AntdSelect value={value} onChange={(v) => onChange?.(v)} options={options} disabled={disabled} size="small" allowClear style={{ width: '100%', ...style }} />
