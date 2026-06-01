import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const ContainerField: FieldRendererFn = (props: any) => {
  const { children, componentProps, style } = props
  const layout = componentProps?.layout || 'vertical'
  const justify = componentProps?.justify || 'start'
  const align = componentProps?.align || 'stretch'
  const wrap = componentProps?.wrap || false
  const background = componentProps?.background
  const borderRadius = componentProps?.borderRadius || 0
  const minHeight = componentProps?.minHeight

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
