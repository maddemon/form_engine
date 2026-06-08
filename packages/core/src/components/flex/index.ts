import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component'

export interface FlexProps extends BaseLayoutComponentProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap?: number | string
  flex?: number | string
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '弹性布局',
  category: 'container',
  icon: 'FlexIcon',
  defaultProps: { componentProps: { direction: 'row', gap: 16 } },
  eventDeclarations: [],
}
