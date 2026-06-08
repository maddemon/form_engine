import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface TitleProps extends BaseComponentProps {
  level?: 1 | 2 | 3 | 4 | 5
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'lighter'
  children?: React.ReactNode
  content?: string
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  strong?: boolean
  italic?: boolean
  underline?: boolean
  mark?: boolean
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '标题',
  category: 'display',
  icon: 'Heading',
  defaultProps: { componentProps: { children: '标题', level: 1 } },
  eventDeclarations: [],
}
