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
  style,
  className,
  id,
  ...rest
}) => {
  return (
    <AntDivider
      type={type}
      orientation={orientation}
      plain={plain}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {children}
    </AntDivider>
  )
}
