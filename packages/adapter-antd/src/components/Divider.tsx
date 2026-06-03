/**
 * Antd Divider 组件
 * 适配 Form Engine 的 DividerProps
 * 使用 Ant Design 的 Divider 组件
 */

import React from 'react'
import { Divider as AntDivider } from 'antd'
import type { DividerProps } from '@form-engine/core'

/**
 * Divider 组件
 */
export const Divider: React.FC<DividerProps> = ({
  children,
  type = 'horizontal',
  orientation = 'center',
  plain = false,
  color,
  thickness,
  style,
  className,
  id,
  ...rest
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(color ? { borderColor: color } : {}),
    ...(thickness ? { borderTopWidth: thickness } : {}),
    ...style,
  }
  return (
    <AntDivider
      type={type}
      orientation={orientation}
      plain={plain}
      style={mergedStyle}
      className={className}
      id={id}
      {...rest}
    >
      {children}
    </AntDivider>
  )
}
