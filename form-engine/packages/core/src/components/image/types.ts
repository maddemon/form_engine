import type { BaseComponentProps } from '../../types/component-props'

/** Image */
export interface ImageProps extends BaseComponentProps {
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  fallback?: string
  preview?: boolean
  borderRadius?: number
}
