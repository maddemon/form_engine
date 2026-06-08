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
  { name: 'onChange', label: '文件变化', description: '上传文件状态变化时触发' },
  { name: 'onRemove', label: '移除文件', description: '移除文件时触发' },
]

export { default as Props } from './UploadPropsRender'

export const meta: ComponentRegistration = {
  label: '上传',
  category: 'form',
  icon: 'Upload',
  defaultProps: { componentProps: { multiple: false, listType: 'text' } },
  eventDeclarations: uploadEventDeclarations,
}
