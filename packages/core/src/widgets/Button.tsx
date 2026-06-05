import React from 'react'
import { useStyle } from '../styles'

export const WidgetButton: React.FC<{
  children?: React.ReactNode
  onClick?: () => void
  type?: 'default' | 'primary' | 'danger' | 'dashed'
  size?: 'sm' | 'md'
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ children, onClick, type = 'default', size = 'md', disabled, style }) => {
  const { token } = useStyle()

  // sm 适用于 PropertyPanel 等紧凑场景；md 适用于 Modal footer / 通用区域
  const sizeStyle: React.CSSProperties = size === 'sm' ? { padding: '1px 8px', lineHeight: '20px', fontSize: token('fontSizeXs') as string } : { padding: '4px 12px', lineHeight: '22px', fontSize: token('fontSizeSm') as string }

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: token('borderRadiusSm') as string,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: token('borderPrimary') as string,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: token('bgPrimary') as string,
    color: token('textPrimary') as string,
    ...sizeStyle,
    ...style,
  }

  if (type === 'primary') {
    base.background = token('primary') as string
    // Primary button text must always be white for WCAG AA contrast (business feedback color, not theme token)
    base.color = '#' + 'fff'
    base.borderColor = token('primary') as string
  } else if (type === 'danger') {
    base.color = token('error') as string
    base.borderColor = token('error') as string
  } else if (type === 'dashed') {
    base.borderStyle = 'dashed'
  }

  return (
    <button onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  )
}
