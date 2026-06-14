import React from 'react'
import { Button as AntdMobileButton } from 'antd-mobile'
import type { ButtonProps } from '@form-engine/core'

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  loading,
  danger,
  onClick,
  disabled,
  block,
  style,
  className,
  id,
}) => {
  const color = danger ? 'danger' :
    type === 'primary' ? 'primary' : 'default'

  const fill = type === 'primary' ? 'solid' :
    type === 'dashed' ? 'outline' :
    type === 'text' ? 'none' :
    type === 'link' ? 'none' : 'outline'

  return (
    <AntdMobileButton
      color={color}
      fill={fill}
      size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'middle'}
      loading={!!loading}
      disabled={!!disabled}
      block={!!block}
      onClick={onClick}
      style={style}
      className={className}
      id={id}
    >
      {children}
    </AntdMobileButton>
  )
}
