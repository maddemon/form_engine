import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const GridField: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema, children, style } = props
  const colSpans = fieldSchema.componentProps?.colSpans ?? []
  const gap = fieldSchema.componentProps?.gap ?? 8

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap, ...style }}>
      {React.Children.map(children, (child, i) => {
        const span = colSpans[i]?.span ?? Math.floor(24 / (colSpans.length || 1))
        return (
          <div key={i} style={{ flex: `0 0 ${(span / 24) * 100}%`, boxSizing: 'border-box' }}>
            {child}
          </div>
        )
      })}
    </div>
  )
}