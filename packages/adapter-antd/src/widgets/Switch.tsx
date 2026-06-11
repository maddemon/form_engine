/**
 * Switch - PropertyPanel 用
 *
 * 使用 antd Switch，size="small" 适配 PropertyPanel 行高。
 */
import { Switch as AntdSwitch } from 'antd'
import React from 'react'
import type { DesignerWidgets } from '@form-engine/core'

type SwitchProps = React.ComponentProps<DesignerWidgets['Switch']>

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, size = 'small', style }) => (
  <AntdSwitch
    checked={!!checked}
    onChange={v => onChange?.(v)}
    disabled={disabled}
    size={size}
    style={style}
  />
)
