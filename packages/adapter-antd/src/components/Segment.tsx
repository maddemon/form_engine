/**
 * Antd Segment 组件
 * 适配 Form Engine 的 SegmentProps
 * 使用 Ant Design 的 Segmented
 */

import type { SegmentProps } from '@form-engine/core'
import { Segmented } from 'antd'
import React from 'react'

/**
 * Segment 分段控制组件
 * display 类型，不作为表单组件
 */
export const Segment: React.FC<SegmentProps> = ({
  options = [],
  value,
  defaultValue,
  size = 'middle',
  block = false,
  disabled = false,
  onChange,
  style,
  className,
  id,
  ...rest
}) => {
  // 将 OptionItem[] 转换为 Segmented 支持的 options 格式
  const segOptions = options.map((opt) => ({
    label: opt.label,
    value: opt.value,
    disabled: opt.disabled,
  }))

  return (
    <Segmented
      id={id}
      className={className}
      options={segOptions}
      value={value}
      defaultValue={defaultValue}
      size={size}
      block={block}
      disabled={disabled}
      onChange={(val) => onChange?.(val)}
      style={style}
    />
  )
}
