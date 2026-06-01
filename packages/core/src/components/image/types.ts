import type { BaseComponentProps } from '../../types/component-props'

/** Image */
export interface ImageProps extends BaseComponentProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fallback?: string
  preview?: boolean
  placeholder?: React.ReactNode
  borderRadius?: number
}


