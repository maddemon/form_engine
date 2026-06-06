import React from 'react'
import { useStyle } from '../styles'

interface TagLabelProps {
  children: React.ReactNode
  /** primary=主题色文字, secondary=文本色文字 */
  variant?: 'primary' | 'secondary'
  fontFamily?: string
  style?: React.CSSProperties
}

/** 小标签/标记组件（如字段名标签、依赖标签） */
export const TagLabel: React.FC<TagLabelProps> = ({ children, variant = 'primary', fontFamily, style }) => {
  const { token } = useStyle()
  return (
    <span
      style={{
        fontSize: token('fontSizeXs'),
        background: 'var(--fe-bg-tertiary)',
        color: variant === 'primary' ? 'var(--fe-primary)' : 'var(--fe-text-secondary)',
        padding: '1px 6px',
        borderRadius: token('borderRadiusSm'),
        border: '1px solid var(--fe-border-primary)',
        fontFamily,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
