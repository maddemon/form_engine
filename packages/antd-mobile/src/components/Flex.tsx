import React from 'react'
import type { FlexProps } from '@form-engine/core'

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 0,
  style,
  className,
  id,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap,
        gap,
        ...style,
      }}
      className={className}
      id={id}
    >
      {children}
    </div>
  )
}
