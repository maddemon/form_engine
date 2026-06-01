import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const TextField: FieldRendererFn = (props: any) => {
  const { children, style } = props
  const content = children || props.content || ''
  const strong = props.strong
  const italic = props.italic
  const underline = props.underline
  const delProp = props.delete
  const code = props.code
  const mark = props.mark
  const type = props.type

  const typeColorMap: Record<string, string> = {
    secondary: '#999',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#ff4d4f',
  }

  let el: React.ReactNode = content

  if (code) el = <code>{el}</code>
  if (mark) el = <mark>{el}</mark>
  if (delProp) el = <del>{el}</del>
  if (underline) el = <u>{el}</u>
  if (italic) el = <i>{el}</i>
  if (strong) el = <strong>{el}</strong>

  return (
    <span style={{ color: type ? typeColorMap[type] : undefined, ...style }}>
      {el}
    </span>
  )
}
