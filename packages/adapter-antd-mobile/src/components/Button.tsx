import React from 'react'
import { Button as AntdMobileButton } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const ButtonField: FieldRendererFn = (props: FieldComponentProps) => {
  const { children, disabled, style, onClick, loading, block, ...rest } = props

  const color = props.type === 'primary' ? 'primary' :
    props.type === 'danger' ? 'danger' :
    props.type === 'dashed' || props.type === 'default' ? 'default' : undefined

  return (
    <AntdMobileButton
      color={color}
      size={props.size === 'small' ? 'small' : props.size === 'large' ? 'large' : 'middle'}
      loading={!!loading}
      disabled={!!disabled}
      block={!!block}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {children}
    </AntdMobileButton>
  )
}
