import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const ContainerField: FieldRendererFn = (props: any) => {
  const { children, style } = props
  const layout = props.layout ?? 'vertical'
  const justify = props.justify ?? 'start'
  const align = props.align ?? 'stretch'
  const wrap = props.wrap ?? false
  const background = props.background
  const borderRadius = props.borderRadius ?? 0
  const minHeight = props.minHeight

  const justifyMap: Record<string, string> = {
    start: 'flex-start', end: 'flex-end', center: 'center',
    between: 'space-between', around: 'space-around', evenly: 'space-evenly',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: layout === 'horizontal' ? 'row' : 'column',
      justifyContent: justifyMap[justify] || 'flex-start',
      alignItems: align,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      background,
      borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      minHeight: minHeight ? `${minHeight}px` : undefined,
      ...style,
    }}>
      {children}
    </div>
  )
}
