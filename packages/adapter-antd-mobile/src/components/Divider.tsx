import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const DividerField: FieldRendererFn = (props: FieldComponentProps) => {
  const { style } = props
  const type = props.type || 'horizontal'
  const children = props.children

  if (type === 'vertical') {
    return <span style={{ borderLeft: '1px solid #ddd', margin: '0 8px', ...style }} />
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999', fontSize: 12, ...style }}>
      <div style={{ flex: 1, borderTop: '1px solid #ddd' }} />
      {children && <span>{children}</span>}
      {children && <div style={{ flex: 1, borderTop: '1px solid #ddd' }} />}
    </div>
  )
}
