import React from 'react'
import { useStyle } from '../styles'

export const WidgetButton: React.FC<{
  children?: React.ReactNode
  onClick?: () => void
  type?: 'default' | 'primary' | 'danger' | 'dashed'
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ children, onClick, type = 'default', disabled, style }) => {
  const { token } = useStyle()

  const base: React.CSSProperties = {
    padding: '1px 8px',
    borderRadius: token('borderRadiusSm') as string,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: token('borderPrimary') as string,
    fontSize: token('fontSizeSm') as string,
    lineHeight: '18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: token('bgPrimary') as string,
    ...style,
  }

  if (type === 'primary') {
    base.background = token('primary') as string
    base.color = token('bgPrimary') as string
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