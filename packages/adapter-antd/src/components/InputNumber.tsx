/**
 * Antd InputNumber 组件
 * 适配 Form Engine 的 InputNumberProps
 */

import type { InputNumberProps } from '@form-engine/core'
import { InputNumber as AntInputNumber } from 'antd'
import React from 'react'

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
      prefix={prefix}
      suffix={suffix}
      disabled={disabled}
      style={{ ...style }}
      className={className}
      id={id}
    />
  )
}
