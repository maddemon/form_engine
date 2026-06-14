import React from 'react'
import { useLocale } from '@form-engine/core/locale'
import type { ImageProps } from '@form-engine/core'

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  style,
  preview = true,
}) => {
  const { locale } = useLocale()

  if (!src) {
    return <div style={{ color: '#999', fontSize: 12, padding: 16, textAlign: 'center', background: '#f5f5f5' }}>{locale.adapter.mobile.image.empty}</div>
  }

  return (
    <img src={src} alt={alt} width={width} height={height} style={{ maxWidth: '100%', ...style }} onClick={preview ? () => window.open(src) : undefined} />
  )
}
