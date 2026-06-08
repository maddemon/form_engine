import { Divider } from 'antd-mobile'
import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const DividerField: FieldRendererFn = (props: FieldComponentProps) => {
  const { style, type = 'horizontal', textPlacement = 'center', color, thickness, children } =
    props as FieldComponentProps & Record<string, unknown>

  const mergedStyle: React.CSSProperties = {
    ...(color ? { borderColor: color } : {}),
    ...(thickness ? { borderTopWidth: thickness as number } : {}),
    ...(style as React.CSSProperties | undefined),
  }

  return (
    <Divider
      direction={type === 'vertical' ? 'vertical' : 'horizontal'}
      contentPosition={textPlacement as 'left' | 'center' | 'right'}
      style={mergedStyle}
    >
      {children as React.ReactNode}
    </Divider>
  )
}
