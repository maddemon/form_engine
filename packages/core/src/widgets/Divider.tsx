import React from 'react'
import { useStyle } from '../styles'

export interface DividerProps {
  direction?: 'top' | 'bottom'
  padding?: boolean
  style?: React.CSSProperties
}

export const Divider: React.FC<DividerProps> = ({ direction = 'top', padding = true, style }) => {
  const { token } = useStyle()

  const borderProp = direction === 'top' ? 'borderTop' : 'borderBottom'
  const paddingProp = direction === 'top' ? 'paddingTop' : 'paddingBottom'

  const dividerStyle: React.CSSProperties = {
    [borderProp]: `1px solid var(--fe-border-light)`,
    ...(padding ? { [paddingProp]: token('spacingSm') } : {}),
    ...style,
  }

  return <div style={dividerStyle} />
}
