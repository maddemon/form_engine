import type { FormRule, VisibleWhen } from '../../types/schema'
import type { BaseFormComponentProps } from '../../types/component-props'

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


