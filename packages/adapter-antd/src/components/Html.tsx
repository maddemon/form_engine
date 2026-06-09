import React from 'react'
import type { HtmlProps } from '@form-engine/core'

export const Html: React.FC<HtmlProps> = ({ content, style, className, id, ...rest }) => {
  return (
    <div
      id={id}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: content ?? '' }}
      {...rest}
    />
  )
}
