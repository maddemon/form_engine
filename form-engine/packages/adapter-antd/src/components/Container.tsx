/**
 * Antd Container 组件
 * 适配 Form Engine 的 ContainerProps
 * 使用 Ant Design 的 Card 作为容器
 */

import React from 'react'
import { Card } from 'antd'
import type { ContainerProps } from '@form-engine/core'

/**
 * Container 组件
 * 通用容器组件
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 0,
  margin = 0,
  background,
  borderRadius = 0,
  border,
  minHeight,
  layout = 'vertical',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  style,
  className,
  id,
  ...rest
}) => {
  // 将 justify 值映射到 flexbox
  const justifyMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  }
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    justifyContent: justifyMap[justify] || 'flex-start',
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    padding: padding === 0 ? undefined : `${padding}px`,
    margin: margin === 0 ? undefined : `${margin}px`,
    background,
    borderRadius: borderRadius === 0 ? undefined : `${borderRadius}px`,
    border,
    minHeight: minHeight ? `${minHeight}px` : undefined,
    boxSizing: 'border-box',
    ...style,
  }
  
  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...rest}
    >
      {children}
    </div>
  )
}
