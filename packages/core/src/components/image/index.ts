import type { BaseComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface ImageProps extends BaseComponentProps {
  src: string
  alt?: string
  width?: number
  height?: number
  mode?: 'scaleToFill' | 'aspectFit' | 'aspectFill' | 'widthFix' | 'heightFix'
  radius?: number
  fallback?: string
  preview?: boolean
  borderRadius?: number
}

export const imageEventDeclarations: EventDeclaration[] = [
  { name: 'onError', label: 'component.image.events.onError.label', description: 'component.image.events.onError.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.image.label',
  category: 'display',
  icon: 'Image',
  defaultProps: {
    componentProps: {
      src: 'https://via.placeholder.com/400x200',
      alt: '图片',
      mode: 'aspectFit',
      width: 200,
      height: 200,
      preview: false,
    },
  },
  eventDeclarations: imageEventDeclarations,
}
