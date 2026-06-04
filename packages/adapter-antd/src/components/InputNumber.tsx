/**
 * Antd InputNumber 组件
 * 适配 Form Engine 的 InputNumberProps
 */

import React from 'react'
import { InputNumber as AntInputNumber } from 'antd'
import type { InputNumberProps } from '@form-engine/core'

/**
 * InputNumber 组件
 */
export const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision,
  decimalSeparator = '.',
  formatter,
  parser,
  prefix,
  suffix,
  disabled,
  style,
  className,
  id,
}) => {
  const handleChange = (val: number | string | null) => {
    onChange?.(val as number | undefined)
  }
  
  return (
    <AntInputNumber
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      precision={precision}
      decimalSeparator={decimalSeparator}
      formatter={formatter}
      parser={parser}
      prefix={prefix}
      suffix={suffix}
      disabled={disabled}
      style={{ ...style }}
      className={className}
      id={id}
    />
  )
}
