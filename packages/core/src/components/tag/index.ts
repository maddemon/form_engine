import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface TagProps extends BaseComponentProps {
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error'
  closable?: boolean
  children?: React.ReactNode
  icon?: string
  size?: 'small' | 'middle'
}

export const meta: ComponentRegistration = {
  label: '标签',
  category: 'display',
  icon: 'Tag',
  defaultProps: { componentProps: { children: '标签内容', type: 'primary' } },
  eventDeclarations: [],
}
