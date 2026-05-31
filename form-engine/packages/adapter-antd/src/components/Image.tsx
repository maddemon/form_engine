/**
 * Antd Image 组件
 * 适配 Form Engine 的 ImageProps
 * 使用 Ant Design 的 Image 组件
 */

import React from 'react'
import { Image as AntImage } from 'antd'
import type { ImageProps } from '@form-engine/core'

/**
 * Image 组件
 */
export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fallback,
  preview = true,
  placeholder,
  style,
  className,
  id,
  ...rest
}) => {
  return (
    <AntImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallback={fallback}
      preview={preview}
      placeholder={placeholder}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}
