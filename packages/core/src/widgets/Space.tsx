import React from 'react'
import { ThemeTokens, useStyle } from '../styles'

// ─── Space ────────────────────────────────────────────────

export type SpaceSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | number

const GAP_TOKEN_MAP: Record<string, keyof ThemeTokens> = {
  xxs: 'spacingXxs',
  xs: 'spacingXs',
  sm: 'spacingSm',
  md: 'spacingMd',
  lg: 'spacingLg',
}

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical'
  gap?: SpaceSize
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  wrap?: boolean
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

export const Space: React.FC<SpaceProps> & { Compact: typeof SpaceCompact } = ({
  direction = 'horizontal',
  gap = 'sm',
  align = 'center',
  justify,
  wrap = false,
  style,
  className,
  children,
}) => {
  const { token } = useStyle()

  const gapValue = typeof gap === 'number' ? gap : token(GAP_TOKEN_MAP[gap])

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: gapValue as string | number,
    alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
    justifyContent: justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  }

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  )
}

// ─── Space.Compact ────────────────────────────────────────

export interface SpaceCompactProps {
  align?: 'start' | 'center' | 'end'
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
}

const SpaceCompact: React.FC<SpaceCompactProps> = ({ align = 'center', style, className, children }) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
    ...style,
  }

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  )
}

Space.Compact = SpaceCompact
