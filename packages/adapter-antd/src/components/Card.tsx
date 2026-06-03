/**
 * Antd Card 组件
 * 适配 Form Engine 的 CardProps
 * 使用 Ant Design 的 Card
 */

import React from 'react'
import { Card as AntdCard } from 'antd'
import type { CardProps } from '@form-engine/core'
import { iconMap } from '@form-engine/core'

/**
 * Card 组件
 * 容器组件，Body 区域可嵌套子组件
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  bordered = true,
  size = 'default',
  bodyPadding,
  bodyGap,
  padding,
  margin,
  gap,
  style,
  className,
  id,
  ...rest
}) => {
  // 解析图标
  let iconNode: React.ReactNode = null
  if (icon && iconMap[icon]) {
    const IconComp = iconMap[icon]
    iconNode = <IconComp size={16} />
  }

  const titleNode = title || iconNode ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {iconNode}
      {title}
    </span>
  ) : undefined

  const bodyStyle: React.CSSProperties = {
    ...(bodyPadding != null ? { padding: bodyPadding } : {}),
    ...(bodyGap != null ? { display: 'flex', flexDirection: 'column', gap: bodyGap } : {}),
  }

  return (
    <AntdCard
      id={id}
      className={className}
      title={titleNode}
      bordered={bordered}
      size={size}
      styles={{ body: bodyStyle }}
      style={{
        ...(padding != null ? { padding } : {}),
        ...(margin != null ? { margin } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </AntdCard>
  )
}
