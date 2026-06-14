import React from 'react'
import type { TitleProps } from '@form-engine/core'

const levelFontSize = ['', '24px', '20px', '18px', '16px', '14px']

const typeColorMap: Record<string, string> = {
  secondary: 'var(--fe-text-tertiary)',
  success: 'var(--fe-success)',
  warning: 'var(--fe-warning)',
  danger: 'var(--fe-error)',
}

export const Title: React.FC<TitleProps> = ({
  content,
  level = 1,
  strong,
  italic,
  underline,
  mark,
  type,
  style,
  className,
  id,
}) => {
  let el: React.ReactNode = content || ''
  if (mark) el = <mark>{el}</mark>
  if (underline) el = <u>{el}</u>
  if (italic) el = <i>{el}</i>
  if (strong) el = <strong>{el}</strong>

  return (
    <div
      style={{
        fontSize: levelFontSize[level] || '20px',
        fontWeight: 600,
        margin: '8px 0',
        color: type ? typeColorMap[type] : undefined,
        ...style,
      }}
      className={className}
      id={id}
    >
      {el}
    </div>
  )
}
