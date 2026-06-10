import { InputNumberProps } from '@form-engine/core'
import { Stepper } from 'antd-mobile'
import React from 'react'

export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  disabled,
  min,
  max,
  step,
  style,
}) => {
  return (
    <Stepper
      value={(value as number) ?? 0}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      style={{ ...style }}
    />
  )
}
