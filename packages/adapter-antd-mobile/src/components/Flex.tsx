import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const FlexField: FieldRendererFn = (props: FieldComponentProps) => {
  const { children, style } = props
  const direction = props.direction ?? 'row'
  const justify = props.justify ?? 'flex-start'
  const align = props.align ?? 'stretch'
  const wrap = props.wrap ?? 'nowrap'
  const gap = props.gap ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: direction, justifyContent: justify, alignItems: align, flexWrap: wrap, gap, ...style }}>
      {children}
    </div>
  )
}
