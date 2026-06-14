import type { UploadFile } from '@form-engine/core'
import { UploadProps } from '@form-engine/core'
import { ImageUploader } from 'antd-mobile'
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader'
import React from 'react'

function toImageUploadItem(file: UploadFile): ImageUploadItem {
  return {
    key: file.uid || file.url,
    url: file.url || '',
    thumbnailUrl: file.url,
  }
}

function toUploadFile(item: ImageUploadItem): UploadFile {
  return {
    uid: String(item.key ?? item.url),
    name: item.url.split('/').pop() || item.url,
    url: item.url,
  }
}

export const Upload: React.FC<UploadProps> = ({
  value,
  onChange,
  disabled,
  accept: acceptProp,
  maxCount,
}) => {
  const accept = acceptProp || 'image/*'
  const maxCountResolved = maxCount || 5
  const fileList: ImageUploadItem[] = (value ?? []).map(toImageUploadItem)

  return (
    <ImageUploader
      value={fileList}
      onChange={(files) => onChange?.(files.map(toUploadFile))}
      disableUpload={disabled}
      deletable={!disabled}
      accept={accept}
      maxCount={maxCountResolved}
      showUpload={!disabled && fileList.length < maxCountResolved}
      upload={() => Promise.reject(new Error('Upload: upload handler required'))}
    />
  )
}
