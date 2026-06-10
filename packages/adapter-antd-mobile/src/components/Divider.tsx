import type { DividerProps } from '@form-engine/core'
import { Divider as AntmDivider } from 'antd-mobile'
import React from 'react'

export const Divider: React.FC<DividerProps> = ({
  type = 'horizontal',
  textPlacement = 'center',
  color,
  thickness,
  children,
  style,
  className,
  id,
}) => {
  const mergedStyle: React.CSSProperties = {
    ...(color ? { borderColor: color } : {}),
    ...(thickness ? { borderTopWidth: thickness as number } : {}),
    ...(style as React.CSSProperties | undefined),
  }

  return (
    <AntmDivider
      direction={type === 'vertical' ? 'vertical' : 'horizontal'}
      contentPosition={textPlacement as 'left' | 'center' | 'right'}
      style={mergedStyle}
      className={className}
      id={id}
    >
      {children as React.ReactNode}
    </AntmDivider>
  )
}
