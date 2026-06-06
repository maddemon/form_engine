import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { iconMap } from '@form-engine/core'
import React from 'react'
import { NoticeBar } from 'antd-mobile'

// Alert type → NoticeBar color 映射
const TYPE_TO_COLOR: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  primary: 'info',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

export const AlertField: FieldRendererFn = (props: FieldComponentProps) => {
  const type = (props.type ?? 'info') as string
  const title = props.title as string | undefined
  const content = (props.content ?? '') as string
  const showIcon = props.showIcon !== false
  const closable = props.closable as boolean | undefined
  const icon = props.icon as string | undefined
  const onClose = props.onClose as (() => void) | undefined

  const color = TYPE_TO_COLOR[type] || 'info'

  // 解析自定义图标
  let iconNode: React.ReactNode = undefined
  if (showIcon) {
    if (icon && iconMap[icon]) {
      const IconComp = iconMap[icon]
      iconNode = <IconComp size={16} />
    }
  } else {
    // 不显示图标时传 null 覆盖默认图标
    iconNode = null as unknown as React.ReactNode
  }

  const displayContent = title ? `${title}: ${content}` : content

  return (
    <NoticeBar
      color={color}
      content={displayContent}
      closeable={closable}
      onClose={onClose}
      icon={iconNode}
      wrap
      style={props.style as React.CSSProperties}
    />
  )
}
