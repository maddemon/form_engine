import type { CardProps } from '@form-engine/core'
import { iconMap } from '@form-engine/core'
import { Card as AntdMobileCard } from 'antd-mobile'
import React from 'react'

export const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  bordered = true,
  bodyPadding,
  bodyGap,
  style,
  className,
}) => {
  let iconNode: React.ReactNode = null
  if (icon && iconMap[icon]) {
    const IconComp = iconMap[icon]
    iconNode = <IconComp size={14} />
  }

  const titleNode =
    title || iconNode ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
        {iconNode}
        {title}
      </span>
    ) : undefined

  const bodyStyle: React.CSSProperties = {
    ...(bodyPadding != null ? { padding: bodyPadding } : {}),
    ...(bodyGap != null ? { display: 'flex', flexDirection: 'column', gap: bodyGap } : {}),
  }

  return (
    <AntdMobileCard
      title={titleNode}
      style={{
        border: bordered ? undefined : 'none',
        ...style,
      }}
      className={className}
    >
      <div style={bodyStyle}>{children}</div>
    </AntdMobileCard>
  )
}
