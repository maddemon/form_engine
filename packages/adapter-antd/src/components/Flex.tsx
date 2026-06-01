/**
 * Antd Flex 组件
 * 适配 Form Engine 的 FlexProps
 * 使用 Ant Design 5 的 Flex 组件
 */

import React from 'react'
import { Flex as AntFlex } from 'antd'
import type { FlexProps } from '@form-engine/core'

/**
 * Flex 组件
 * 提供弹性布局
 */
export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 0,
  flex,
  style,
  className,
  id,
  ...rest
}) => {
  return (
    <AntFlex
      vertical={direction === 'column' || direction === 'column-reverse'}
      justify={justify as any}
      align={align as any}
      wrap={wrap === 'wrap'}
      gap={gap}
      flex={flex}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {children}
    </AntFlex>
  )
}
