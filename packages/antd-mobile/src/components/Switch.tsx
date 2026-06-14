import { SwitchProps } from '@form-engine/core'
import { Switch as AntmSwitch } from 'antd-mobile'
import React from 'react'

export const Switch: React.FC<SwitchProps> = ({ value, onChange, disabled }) => {
  return <AntmSwitch checked={!!value} onChange={(v) => onChange?.(v)} disabled={disabled} />
}
