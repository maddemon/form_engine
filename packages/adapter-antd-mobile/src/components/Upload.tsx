import { ImageUploader } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const UploadField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const accept = (fieldSchema.componentProps as any)?.accept as string || 'image/*'
  const maxCount = ((fieldSchema.componentProps as any)?.maxCount as number) || 5

  const fileList = ((value as string[]) || []).map((url, idx) => ({
    url,
    key: String(idx),
  }))

  return (
    <ImageUploader
      value={fileList}
      onChange={files => onChange?.(files.map(f => f.url))}
      disabled={disabled}
      accept={accept}
      maxCount={maxCount}
      showUpload={fileList.length < maxCount}
    />
  )
}
