import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const TextField: FieldRendererFn = (props: any) => {
  const { componentProps, children, style } = props
  const content = children || componentProps?.content || ''
  const strong = componentProps?.strong
  const italic = componentProps?.italic
  const underline = componentProps?.underline
  const delProp = componentProps?.delete
  const code = componentProps?.code
  const mark = componentProps?.mark
  const type = componentProps?.type

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
