import type { BaseComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

/** Alert 警告提示 */
export interface AlertProps extends BaseComponentProps {
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error'
  title?: string
  content: string
  showIcon?: boolean
  closable?: boolean
  icon?: string
  onClose?: () => void
}

export const alertEventDeclarations: EventDeclaration[] = [
  { name: 'onClose', label: 'component.alert.events.onClose.label', description: 'component.alert.events.onClose.description' },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.alert.label',
  category: 'display',
  icon: 'AlertIcon',
  defaultProps: (locale) => ({
    componentProps: {
      type: 'info',
      content: locale?.component.alert.contentPlaceholder ?? 'Alert content',
      showIcon: true,
      closable: false,
    },
  }),
  eventDeclarations: alertEventDeclarations,
}
