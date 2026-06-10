import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface TextProps extends BaseComponentProps {
  type?: 'secondary' | 'success' | 'warning' | 'danger'
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'lighter'
  lineHeight?: number
  content?: string
  strong?: boolean
  italic?: boolean
  underline?: boolean
  delete?: boolean
  code?: boolean
  mark?: boolean
  keyboard?: boolean
  ellipsis?: boolean
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.text.label',
  category: 'display',
  icon: 'LetterA',
  defaultProps: (locale) => ({
    componentProps: { content: locale?.component.text.defaultContent ?? 'Text content' },
  }),
  eventDeclarations: [],
}
