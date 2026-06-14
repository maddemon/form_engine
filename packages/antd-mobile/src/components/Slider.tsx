import { SliderProps } from '@form-engine/core'
import { Slider as AntmSlider } from 'antd-mobile'
import React from 'react'

export const Slider: React.FC<SliderProps> = ({ value, onChange, disabled, min, max, step }) => {
  return (
    <AntmSlider
      value={(value as number) ?? 0}
      onChange={(v) => onChange?.(v)}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
    />
  )
}
