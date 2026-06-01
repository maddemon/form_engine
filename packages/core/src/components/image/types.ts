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
}

/**
 * Image 属性面板配置
 */
export const ImagePropConfig = {
  src: { type: 'string', label: '图片地址', default: '' },
  alt: { type: 'string', label: '替代文本', default: '' },
  width: { type: 'number', label: '宽度', default: undefined },
  height: { type: 'number', label: '高度', default: undefined },
  preview: { type: 'boolean', label: '预览', default: true },
} as const
