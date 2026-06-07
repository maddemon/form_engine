import React, { useState } from 'react'
import { useStyle } from '../styles'

export type WidgetButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link'
export type WidgetButtonColor = 'default' | 'primary' | 'danger' | 'warning'

const COLOR_MAP: Record<WidgetButtonColor, { main: string; text?: string }> = {
  default: { main: '--fe-border-primary' },
  primary: { main: '--fe-primary', text: '#' + 'fff' },
  danger: { main: '--fe-error' },
  warning: { main: '--fe-warning' },
}

export const WidgetButton: React.FC<{
  label?: string
  children?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  type?: WidgetButtonType
  color?: WidgetButtonColor
  size?: 'sm' | 'md'
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ label, children, onClick, type = 'default', color = 'default', size = 'md', disabled, style }) => {
  const { token } = useStyle()
  const [hovered, setHovered] = useState(false)

  // sm 适用于 PropertyPanel 等紧凑场景；md 适用于 Modal footer / 通用区域
  const sizeStyle: React.CSSProperties =
    size === 'sm' ? { padding: '1px 8px', lineHeight: '20px', fontSize: token('fontSizeXs') as string } : { padding: '4px 12px', lineHeight: '22px', fontSize: token('fontSizeSm') as string }

  const colorConfig = COLOR_MAP[color]
  const colorMain = colorConfig.main.startsWith('--') ? `var(${colorConfig.main})` : colorConfig.main
  const colorText = colorConfig.text ?? colorMain

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
  }

  // type 决定外观形态
  if (type === 'primary') {
    base.background = colorMain
    base.color = colorText
    base.borderColor = colorMain
  } else if (type === 'dashed') {
    base.borderStyle = 'dashed'
    base.color = colorMain
    base.borderColor = colorMain
  } else if (type === 'text') {
    base.border = 'none'
    base.background = hovered ? 'var(--fe-bg-secondary)' : 'transparent'
    base.color = colorMain
  } else if (type === 'link') {
    base.border = 'none'
    base.background = 'transparent'
    base.color = colorMain
    base.textDecoration = hovered ? 'underline' : 'none'
  } else {
    // default
    base.color = colorMain
    base.borderColor = color === 'default' ? token('borderPrimary') as string : colorMain
  }

  // style 最后合并，允许覆盖
  Object.assign(base, style)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={base}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}
