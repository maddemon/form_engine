import React from 'react'

export const WidgetButton: React.FC<{
  children?: React.ReactNode
  onClick?: () => void
  type?: 'default' | 'primary' | 'danger' | 'dashed'
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ children, onClick, type = 'default', disabled, style }) => {
  const base: React.CSSProperties = {
    padding: '3px 12px',
    borderRadius: 4,
    border: '1px solid #d9d9d9',
    fontSize: 12,
    lineHeight: '20px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: '#fff',
    ...style,
  }

  if (type === 'primary') {
    base.background = '#1677ff'
    base.color = '#fff'
    base.borderColor = '#1677ff'
  } else if (type === 'danger') {
    base.color = '#ff4d4f'
    base.borderColor = '#ff4d4f'
  } else if (type === 'dashed') {
    base.borderStyle = 'dashed'
  }

  return (
    <button onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  )
}
