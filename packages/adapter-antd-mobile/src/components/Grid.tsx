import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const GridField: FieldRendererFn = (props: any) => {
  const { children, style, componentProps } = props
  const columns = componentProps?.columns || 24
  const gap = componentProps?.gap || 8

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap, ...style }}>
      {React.Children.map(children, (child, i) => (
        <div key={i} style={{ flex: `0 0 ${(columns / 24) * 100}%`, boxSizing: 'border-box' }}>
          {child}
        </div>
      ))}
    </div>
  )
}
