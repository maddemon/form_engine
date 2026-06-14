/**
 * Antd Divider 组件
 * 适配 Form Engine 的 DividerProps
 * 使用 Ant Design 的 Divider 组件
 */

import type { DividerProps } from '@form-engine/core'
import { Divider as AntDivider } from 'antd'
import React from 'react'

/**
 * Divider 组件
 */
export const Divider: React.FC<DividerProps> = ({
  children,
  type = 'horizontal',
  textPlacement = 'center',
  plain = false,
  color,
  thickness,
  style,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      orientation={type}
      titlePlacement={textPlacement}
      plain={plain}
      style={mergedStyle}
      className={className}
      {...rest}
    >
      {children}
    </AntDivider>
  )
}
