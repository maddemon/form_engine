import type { BaseLayoutComponentProps, ComponentCategory, ComponentRegistration } from '../../types/component'

export interface SubFormColumnConfig {
  id: string
  label: string
  width: number
}

export interface SubFormProps extends BaseLayoutComponentProps {
  title?: string
  description?: string
  columns: SubFormColumnConfig[]
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '子表单',
  category: ['form', 'container'] as ComponentCategory[],
  icon: 'FolderInput',
  defaultProps: {},
  eventDeclarations: [],
}
