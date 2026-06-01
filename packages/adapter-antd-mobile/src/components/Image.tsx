import React from 'react'
import type { FieldRendererFn } from '@form-engine/core'

export const ImageField: FieldRendererFn = (props: any) => {
  const { componentProps, style } = props
  const src = componentProps?.src
  const alt = componentProps?.alt || ''
  const width = componentProps?.width
  const height = componentProps?.height
  const preview = componentProps?.preview !== false

  if (!src) {
    return <div style={{ color: '#999', fontSize: 12, padding: 16, textAlign: 'center', background: '#f5f5f5' }}>无图片</div>
  }

  return (
    <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: '100%', ...style }} onClick={preview ? () => window.open(src) : undefined} />
  )
}
