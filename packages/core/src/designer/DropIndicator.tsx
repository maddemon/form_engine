import React from 'react'
import { useStyle } from '../styles'

export const DropIndicator: React.FC = () => {
  const { token } = useStyle()
  return (
    <div
      style={{
        outline: `${token('spacingXxs')} solid var(--fe-primary)`,
        pointerEvents: 'none',
      }}
    />
  )
}
