import type { AlertProps } from '@form-engine/core'
import { iconMap } from '@form-engine/core'
import { NoticeBar, NoticeBarProps } from 'antd-mobile'
import React from 'react'

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  content,
  showIcon = true,
  closable,
  icon,
  onClose,
  style,
  className,
}) => {
  let iconNode: React.ReactNode = undefined
  if (showIcon) {
    if (icon && iconMap[icon]) {
      const IconComp = iconMap[icon]
      iconNode = <IconComp size={16} />
    }
  } else {
    iconNode = null as unknown as React.ReactNode
  }

  const displayContent = title ? `${title}: ${content}` : content

  return (
    <NoticeBar
      color={type as NoticeBarProps['color']}
      content={displayContent}
      closeable={closable}
      onClose={onClose as (() => void) | undefined}
      icon={iconNode}
      wrap
      style={style}
      className={className}
    />
  )
}
