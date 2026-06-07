import React from 'react'
import { useStyle } from '../styles'

export interface TextProps {
  type?: 'secondary' | 'tertiary' | 'placeholder'
  ellipsis?: boolean
  style?: React.CSSProperties
  children?: React.ReactNode
}

const TYPE_CONFIG = {
  secondary: { fontSizeToken: 'fontSizeXs', colorVar: '--fe-text-secondary' },
  tertiary: { fontSizeToken: 'fontSizeXs', colorVar: '--fe-text-tertiary' },
  placeholder: { fontSizeToken: 'fontSizeSm', colorVar: '--fe-text-placeholder' },
} as const

export const Text: React.FC<TextProps> = ({ type = 'secondary', ellipsis = false, style, children }) => {
  const { token } = useStyle()

  const config = TYPE_CONFIG[type]

  const textStyle: React.CSSProperties = {
    fontSize: token(config.fontSizeToken) as string,
    color: `var(${config.colorVar})`,
    ...(ellipsis && { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
    ...style,
  }

  return <div style={textStyle}>{children}</div>
}
