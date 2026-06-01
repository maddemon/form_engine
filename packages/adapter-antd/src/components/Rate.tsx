/**
 * Antd Rate 组件
 * 适配 Form Engine 的 RateProps
 */

import React from 'react'
import { Rate as AntRate } from 'antd'
import type { RateProps } from '@form-engine/core'

/**
 * Rate 组件
 */
export const Rate: React.FC<RateProps> = ({
  value,
  onChange,
  count = 5,
  allowHalf,
  character,
  tooltips,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (val: number) => {
    onChange?.(val)
  }
  
  return (
    <AntRate
      value={value}
      onChange={handleChange}
      count={count}
      allowHalf={allowHalf}
      character={character}
      tooltips={tooltips}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}
