import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component'

export interface CardProps extends BaseLayoutComponentProps {
  title?: string
  icon?: string
  bordered?: boolean
  size?: 'default' | 'small'
  bodyPadding?: number
  bodyGap?: number
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.card.label',
  category: 'container',
  icon: 'CardIcon',
  defaultProps: {
    componentProps: {
      title: '卡片标题',
      bodyPadding: 16,
      bodyGap: 8,
      bordered: true,
      size: 'default',
    },
  },
  eventDeclarations: [],
}
