import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

/** Upload */
export interface UploadProps extends BaseFormComponentProps<string[] | undefined> {
  action?: string
  accept?: string
  maxCount?: number
  listType?: 'text' | 'picture' | 'picture-card'
  multiple?: boolean
  directory?: boolean
  showUploadList?: boolean
  beforeUpload?: (file: File) => boolean | Promise<void>
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
}

export interface UploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'done' | 'error' | 'removed'
  response?: any
  url?: string
  thumbUrl?: string
  percent?: number
}

/** Upload 支持的事件声明（供设计器使用） */
export const uploadEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '文件变化', description: '上传中/完成/失败时触发', async: true },
  { name: 'beforeUpload', label: '上传前', description: '上传前校验，返回 false 阻止上传', async: true },
]


