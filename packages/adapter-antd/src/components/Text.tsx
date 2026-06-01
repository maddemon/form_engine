/**
 * Antd Text 组件
 * 适配 Form Engine 的 TextProps
 * 使用 Ant Design 的 Typography.Text
 */

import React from 'react'
import { Typography } from 'antd'
import type { TextProps } from '@form-engine/core'

const { Text: AntText } = Typography

/**
 * Text 组件
 */
export const Text: React.FC<TextProps> = ({
  children,
  content,
  type,
  strong = false,
  italic = false,
  keyboard = false,
  mark = false,
  underline = false,
  delete: deleteProp = false,
  code = false,
  disabled = false,
  ellipsis = false,
  style,
  className,
  id,
  ...rest
}) => {
  // 构建 Typography.Text 的 props
  const textProps: any = {
    type,
    strong,
    italic,
    keyboard,
    mark,
    underline,
    delete: deleteProp,
    code,
    disabled,
    ellipsis,
    style,
    className,
    id,
    ...rest,
  }
  
  // 优先使用 children，其次使用 content
  const textContent = children || content || ''
  
  return (
    <AntText {...textProps}>
      {textContent}
    </AntText>
  )
}
