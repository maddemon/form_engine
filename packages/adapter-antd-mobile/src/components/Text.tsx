import React from 'react'
import type { TextProps } from '@form-engine/core'

const typeColorMap: Record<string, string> = {
  secondary: 'var(--fe-text-tertiary)',
  success: 'var(--fe-success)',
  warning: 'var(--fe-warning)',
  danger: 'var(--fe-error)',
}

export const Text: React.FC<TextProps> = ({
  children,
  content,
  type,
  strong = false,
  italic = false,
  underline = false,
  delete: delProp = false,
  code = false,
  mark = false,
  style,
}) => {
  let el: React.ReactNode = children || content || ''
  if (code) el = <code>{el}</code>
  if (mark) el = <mark>{el}</mark>
  if (delProp) el = <del>{el}</del>
  if (underline) el = <u>{el}</u>
  if (italic) el = <i>{el}</i>
  if (strong) el = <strong>{el}</strong>

  return (
    <span style={{ whiteSpace: 'pre-wrap', color: type ? typeColorMap[type] : undefined, ...style }}>
      {el}
    </span>
  )
}
