import React from 'react'
import { useStyle } from '../styles'

export const BASE_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 6px',
  borderRadius: 'var(--fe-border-radius-sm)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--fe-border-primary)',
  fontSize: 'var(--fe-font-size-sm)',
  lineHeight: '18px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'var(--fe-bg-primary)',
  color: 'var(--fe-text-primary)',
}

export const FOCUS_STYLE: React.CSSProperties = {
  borderColor: 'var(--fe-primary)',
  boxShadow: '0 0 0 2px var(--fe-primary-bg)',
}
