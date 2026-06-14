import { RateProps } from '@form-engine/core'
import { Rate as AntmRate } from 'antd-mobile'
import React from 'react'

export const Rate: React.FC<RateProps> = ({ value, onChange, disabled, count, allowHalf }) => {
  return (
    <AntmRate
      value={(value as number) ?? 0}
      onChange={(v) => onChange?.(v)}
      readOnly={disabled}
      count={count}
      allowHalf={allowHalf}
    />
  )
}
