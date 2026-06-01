/**
 * Antd Slider 组件
 * 适配 Form Engine 的 SliderProps
 */

import React from 'react'
import { Slider as AntSlider } from 'antd'
import type { SliderProps } from '@form-engine/core'

/**
 * Slider 组件
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks,
  dots,
  included = true,
  range,
  tooltip,
  vertical,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (val: number | [number, number]) => {
    onChange?.(val)
  }
  
  return (
    <AntSlider
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      marks={marks}
      dots={dots}
      included={included}
      range={range}
      tooltip={tooltip}
      vertical={vertical}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}
