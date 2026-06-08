import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface HtmlProps extends BaseComponentProps {
  content: string
}

export const meta: ComponentRegistration = {
  label: 'component.html.label',
  category: 'display',
  icon: 'Code',
  defaultProps: { componentProps: { content: '<p>HTML 内容</p>' } },
  eventDeclarations: [],
}
