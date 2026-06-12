import React from 'react'
import { useStyle } from '../styles'

/** 小节标题变体 */
type SectionTitleVariant = 'primary' | 'secondary'

interface SectionTitleProps {
  variant?: SectionTitleVariant
  children: React.ReactNode
  style?: React.CSSProperties
}

/** 属性面板小节标题，统一 margin/fontSize/color */
export const SectionTitle: React.FC<SectionTitleProps> = ({ variant = 'primary', children, style }) => {
  const { token } = useStyle()

  const baseStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          margin: `0 0 ${token('spacingMd')} 0`,
          fontSize: token('fontSizeMd'),
          fontWeight: 500,
          color: token('textSecondary') as string,
        }
      : {
          margin: `${token('spacingMd')} 0 ${token('spacingSm')} 0`,
          fontSize: token('fontSizeSm'),
          fontWeight: 500,
          color: token('textTertiary') as string,
        }

  return <h4 style={{ ...baseStyle, ...style }}>{children}</h4>
}

interface DividerProps {
  style?: React.CSSProperties
}

/** 分割线 */
export const Divider: React.FC<DividerProps> = ({ style }) => {
  const { token } = useStyle()
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--fe-border-primary)',
        margin: `${token('spacingMd')} 0`,
        ...style,
      }}
    />
  )
}

interface TooltipIconProps {
  tooltip: string
}

/** Tooltip "?" 图标 */
export const TooltipIcon: React.FC<TooltipIconProps> = ({ tooltip }) => {
  const { token } = useStyle()
  return (
    <span
      title={tooltip}
      style={{
        marginLeft: 'var(--fe-spacing-xs, 4px)',
        cursor: 'help',
        color: token('textTertiary') as string,
      }}
    >
      ?
    </span>
  )
}

interface ErrorMessageProps {
  children: React.ReactNode
  /** margin 方向 */
  margin?: 'top' | 'bottom'
  style?: React.CSSProperties
}

/** 错误信息展示 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ children, margin = 'bottom', style }) => {
  const { token } = useStyle()
  const marginProp = margin === 'top' ? 'marginTop' : 'marginBottom'
  return (
    <div
      style={{
        color: token('error') as string,
        fontSize: token('fontSizeXs') as string,
        [marginProp]: token('spacingXs'),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** 面板边框样式常量 */
export const PANEL_BORDER: React.CSSProperties = {
  borderLeft: '1px solid var(--fe-border-light)',
}

export const PANEL_BORDER_RIGHT: React.CSSProperties = {
  borderRight: '1px solid var(--fe-border-light)',
}
