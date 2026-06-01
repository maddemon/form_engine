import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const FlexField: FieldRendererFn = (props: any) => {
  const { children, componentProps, style } = props
  const direction = componentProps?.direction || 'row'
  const justify = componentProps?.justify || 'flex-start'
  const align = componentProps?.align || 'stretch'
  const wrap = componentProps?.wrap || 'nowrap'
  const gap = componentProps?.gap || 0

  return (
    <div style={{ display: 'flex', flexDirection: direction, justifyContent: justify, alignItems: align, flexWrap: wrap, gap, ...style }}>
      {children}
    </div>
  )
}
