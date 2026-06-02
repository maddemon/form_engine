/**
 * Antd Button 组件
 * 适配 Form Engine 的 ButtonProps
 */

import React from 'react'
import { Button as AntButton } from 'antd'
import type { ButtonProps } from '@form-engine/core'

/**
 * 将 Form Engine 的 ButtonProps 映射为 Antd Button props
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'default',
  size = 'middle',
  htmlType = 'button',
  loading,
  danger,
  onClick,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  // 映射 type
  const antType = type === 'default' ? 'default' : type

  return (
    <AntButton
      type={antType as any}
      size={size}
      htmlType={htmlType}
      loading={loading}
      danger={danger}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {children}
    </AntButton>
  )
}
