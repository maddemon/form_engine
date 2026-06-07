import React from 'react'
import { Button as AntdMobileButton } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const ButtonField: FieldRendererFn = (props: FieldComponentProps) => {
  const { children, disabled, style, onClick, loading, block, ...rest } = props

  // antd-mobile Button 的 color 属性：primary / success / warning / default / danger
  // 新 API：type 控制外观形态，color 控制颜色
  const color = props.color === 'danger' ? 'danger' :
    props.color === 'warning' ? 'warning' :
    props.color === 'primary' || props.type === 'primary' ? 'primary' : 'default'

  const fill = props.type === 'primary' ? 'solid' :
    props.type === 'dashed' ? 'outline' :
    props.type === 'text' ? 'none' :
    props.type === 'link' ? 'none' : 'outline'

  return (
    <AntdMobileButton
      color={color}
      fill={fill}
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
