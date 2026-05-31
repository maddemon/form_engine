import type { BaseFormComponentProps } from '../../types/component-props'

/** Upload */
export interface UploadProps extends BaseFormComponentProps<UploadFile[] | undefined> {
  action?: string
  method?: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  data?: Record<string, unknown>
  accept?: string
  multiple?: boolean
  maxCount?: number
  listType?: 'text' | 'picture' | 'picture-card'
  showUploadList?: boolean
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  onRemove?: (file: UploadFile) => void
}

export interface UploadFile {
  uid: string
  name: string
  status?: 'uploading' | 'done' | 'error' | 'removed'
  url?: string
  response?: unknown
  error?: unknown
  originFile?: File
}
