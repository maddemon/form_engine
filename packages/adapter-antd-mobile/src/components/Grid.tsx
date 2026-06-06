import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const GridField: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema, children, style } = props
  const gap = fieldSchema.componentProps?.gap ?? 8
  const childrenArray = React.Children.toArray(children)

  // 移动端 Grid 无视列数，直接垂直平铺
  return (
    <div style={{ width: '100%', ...style }}>
      {childrenArray.map((child, i) => (
        <div key={i} style={{ width: '100%', marginBottom: i < childrenArray.length - 1 ? gap : 0 }}>{child}</div>
      ))}
    </div>
  )
}