import type { SegmentProps } from '@form-engine/core'
import { Segmented } from 'antd-mobile'
import React from 'react'

export const Segment: React.FC<SegmentProps> = ({
  value,
  onChange,
  options = [],
  disabled,
  block,
  _size,
  style,
  className,
  id,
}) => {
  const segOptions = (options as any[]).map((opt: any) => ({
    label: opt.label,
    value: opt.value,
    disabled: opt.disabled,
  }))

  return (
    <Segmented
      value={value}
      options={segOptions}
      block={block}
      disabled={disabled}
      onChange={(val) => onChange?.(val as string | number)}
      style={style}
      className={className}
      id={id}
    />
  )
}
