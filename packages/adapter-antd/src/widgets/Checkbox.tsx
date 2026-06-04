/**
 * Antd Checkbox - PropertyPanel 用
 */
import { Checkbox as AntdCheckbox } from 'antd'
import React from 'react'

export const Checkbox: React.FC<any> = ({ checked, onChange, disabled, style }) => (
  <AntdCheckbox
    checked={!!checked}
    onChange={v => onChange?.(v.target.checked)}
    disabled={disabled}
    style={style}
  />
)
