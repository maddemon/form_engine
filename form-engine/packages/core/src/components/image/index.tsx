import React, { useState } from 'react'
import type { ImageProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Image 组件（默认实现）
 * Ant Design 风格
 */
export const Image: React.FC<ImageProps> = ({
  src = '',
  alt = '',
  width,
  height,
  objectFit = 'cover',
  fallback,
  preview = true,
  borderRadius = 0,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const [error, setError] = useState(false)
  const { token } = useStyle()

  const imgStyle: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    objectFit,
    borderRadius: borderRadius === 0 ? undefined : `${borderRadius}px`,
    display: 'block',
    ...propsStyle,
  }

  const handleError = () => {
    if (fallback) {
      setError(true)
    }
  }

  const handlePreview = () => {
    if (preview && src && !error) {
      window.open(src, '_blank')
    }
  }

  return (
    <img
      src={error && fallback ? fallback : src}
      alt={alt}
      id={id}
      className={className}
      style={{
        ...imgStyle,
        ...(preview && src && !error ? { cursor: 'pointer' } : {}),
      }}
      onClick={handlePreview}
      onError={handleError}
      {...rest}
    />
  )
}
