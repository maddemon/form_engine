import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface DividerProps extends BaseComponentProps {
  type?: 'horizontal' | 'vertical'
  textPlacement?: 'left' | 'center' | 'right'
  plain?: boolean
  children?: React.ReactNode
  color?: string
  thickness?: number
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.divider.label',
  category: 'display',
  icon: 'Minus',
  defaultProps: {},
  eventDeclarations: [],
}
