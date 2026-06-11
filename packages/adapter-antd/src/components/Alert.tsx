/**
 * Antd Alert 组件
 * 适配 Form Engine 的 AlertProps
 * 使用 Ant Design 的 Alert
 */

import type { AlertProps } from '@form-engine/core'
import { iconMap } from '@form-engine/core'
import { Alert as AntdAlert } from 'antd'
import React from 'react'

/**
 * Alert 组件
 * 警告提示（display 类型）
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  content,
  showIcon = true,
  closable = false,
  icon,
  onClose,
  style,
  className,
  id,
}) => {
  // antd Alert 不支持 'primary'，映射为 'info'
  const antdType = type === 'primary' ? 'info' : type

  // 解析自定义图标
  let iconNode: React.ReactNode = undefined
  if (icon && iconMap[icon]) {
    const IconComp = iconMap[icon]
    iconNode = <IconComp size={16} />
  }

  return (
    <AntdAlert
      id={id}
      className={className}
      type={antdType}
      message={title || ''}
      description={content}
      showIcon={showIcon}
      icon={iconNode}
      closable={closable}
      onClose={onClose}
      style={style}
    />
  )
}
