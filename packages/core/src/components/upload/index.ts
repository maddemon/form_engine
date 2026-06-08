import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'

export interface UploadFile {
  uid: string
  name: string
  url?: string
  status?: 'done' | 'uploading' | 'error' | 'removed'
  size?: number
}

export interface UploadProps extends BaseFormComponentProps<UploadFile[] | undefined> {
  action?: string
  accept?: string
  multiple?: boolean
  maxCount?: number
  limitSize?: number
  listType?: 'text' | 'picture' | 'picture-card'
  disabled?: boolean
  drag?: boolean
  showUploadList?: boolean
  children?: React.ReactNode
}

export const uploadEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: 'component.upload.events.onChange.label', description: 'component.upload.events.onChange.description' },
  { name: 'onRemove', label: 'component.upload.events.onRemove.label', description: 'component.upload.events.onRemove.description' },
]

export { default as Props } from './UploadPropsRender'

export const meta: ComponentRegistration = {
  label: 'component.upload.label',
  category: 'form',
  icon: 'Upload',
  defaultProps: { componentProps: { multiple: false, listType: 'text' } },
  eventDeclarations: uploadEventDeclarations,
}
