import { ImageUploader } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const UploadField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const cp = fieldSchema.componentProps ?? {}
  const accept = (cp.accept as string) || 'image/*'
  const maxCount = (cp.maxCount as number) || 5
  const userUpload = cp.upload as ((file: File) => Promise<{ url: string }>) | undefined

  const fileList = ((value as string[]) || []).map((url, idx) => ({
    url,
    key: String(idx),
  }))

  return (
    <ImageUploader
      value={fileList}
      onChange={files => onChange?.(files.map(f => f.url))}
      disableUpload={disabled}
      deletable={!disabled}
      accept={accept}
      maxCount={maxCount}
      showUpload={!disabled && fileList.length < maxCount}
      upload={userUpload ?? (() => { throw new Error('UploadField: componentProps.upload is required') })}
    />
  )
}
