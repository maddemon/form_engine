import React from 'react'
import type { GridProps } from '@form-engine/core'

export const Grid: React.FC<GridProps> = ({
  children,
  gap = 8,
  style,
  className,
  id,
}) => {
  const childrenArray = React.Children.toArray(children)

  return (
    <div style={{ width: '100%', ...style }} className={className} id={id}>
      {childrenArray.map((child, i) => (
        <div key={i} style={{ width: '100%', marginBottom: i < childrenArray.length - 1 ? (gap as number) : 0 }}>{child}</div>
      ))}
    </div>
  )
}
