import React from 'react'
import { useLocale } from '@form-engine/core/locale'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const ImageField: FieldRendererFn = (props: FieldComponentProps) => {
  const { locale } = useLocale()
  const { style } = props
  const src = props.src
  const alt = props.alt || ''
  const width = props.width
  const height = props.height
  const preview = props.preview !== false

  if (!src) {
    return <div style={{ color: '#999', fontSize: 12, padding: 16, textAlign: 'center', background: '#f5f5f5' }}>{locale.adapter.mobile.image.empty}</div>
  }

  return (
    <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: '100%', ...style }} onClick={preview ? () => window.open(src) : undefined} />
  )
}
