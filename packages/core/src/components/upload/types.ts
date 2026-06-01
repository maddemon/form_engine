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

/**
 * Upload 属性面板配置
 */
export const UploadPropConfig = {
  accept: { type: 'string', label: '文件类型', default: '' },
  maxCount: { type: 'number', label: '最大数量', default: undefined },
  listType: {
    type: 'select',
    label: '列表类型',
    default: 'text',
    options: [
      { label: '文本', value: 'text' },
      { label: '图片', value: 'picture' },
      { label: '卡片', value: 'picture-card' },
    ],
  },
  multiple: { type: 'boolean', label: '多文件', default: false },
  showUploadList: { type: 'boolean', label: '显示列表', default: true },
} as const
