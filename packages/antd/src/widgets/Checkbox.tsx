/**
 * Antd Checkbox - PropertyPanel 用
 */
import { DesignerWidgets } from '@form-engine/core'
import { Checkbox as AntdCheckbox } from 'antd'
import React from 'react'

type CheckboxProps = React.ComponentProps<DesignerWidgets['Checkbox']>

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled, style }) => (
  <AntdCheckbox checked={!!checked} onChange={(v) => onChange?.(v.target.checked)} disabled={disabled} style={style} />
)
