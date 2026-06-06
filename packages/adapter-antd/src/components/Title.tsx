import React from 'react'
import { Typography } from 'antd'
import type { TitleProps } from '@form-engine/core'

const { Title: AntTitle } = Typography

export const Title: React.FC<TitleProps> = ({
  children,
  content,
  level = 1,
  strong = false,
  italic = false,
  underline = false,
  delete: deleteProp = false,
  code = false,
  mark = false,
  keyboard = false,
  type,
  disabled = false,
  ellipsis = false,
  textAlign,
  style,
  className,
  id,
  ...rest
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(textAlign ? { textAlign } : {}),
    ...style,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titleProps: any = {
    level,
    type,
    strong,
    italic,
    underline,
    delete: deleteProp,
    code,
    mark,
    keyboard,
    disabled,
    ellipsis,
    style: mergedStyle,
    className,
    id,
    ...rest,
  }

  const titleContent = children || content || ''

  return (
    <AntTitle {...titleProps}>
      {titleContent}
    </AntTitle>
  )
}
