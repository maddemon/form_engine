import React from 'react'
import { Card as AntdMobileCard } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { iconMap } from '@form-engine/core'

export const CardField: FieldRendererFn = (props: FieldComponentProps) => {
  const { children, style } = props
  const title = props.title
  const icon = props.icon
  const bordered = props.bordered !== false
  const size = props.size ?? 'default'
  const bodyPadding = props.bodyPadding
  const bodyGap = props.bodyGap

  // 解析图标
  let iconNode: React.ReactNode = null
  if (icon && iconMap[icon]) {
    const IconComp = iconMap[icon]
    iconNode = <IconComp size={14} />
  }

  const titleNode = title || iconNode ? (
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
    >
      <div style={bodyStyle}>{children}</div>
    </AntdMobileCard>
  )
}
