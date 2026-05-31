/**
 * Antd Upload 组件
 * 适配 Form Engine 的 UploadProps
 */

import React from 'react'
import { Upload as AntUpload } from 'antd'
import type { UploadProps, UploadFile } from '@form-engine/core'

const { Dragger } = AntUpload

/**
 * Upload 组件
 */
export const Upload: React.FC<UploadProps> = ({
  value,
  onChange,
  action,
  accept,
  maxCount,
  listType = 'text',
  multiple,
  directory,
  showUploadList = true,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (info: any) => {
    const fileList = info.fileList.map((file: any) => ({
      uid: file.uid,
      name: file.name,
      status: file.status,
      response: file.response,
      url: file.url,
      thumbUrl: file.thumbUrl,
      percent: file.percent,
    }))
    onChange?.(fileList)
  }
  
  return (
    <AntUpload
      action={action}
      accept={accept}
      maxCount={maxCount}
      listType={listType}
      multiple={multiple}
      directory={directory}
      showUploadList={showUploadList}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      onChange={handleChange}
      {...rest}
    >
      {rest.children}
    </AntUpload>
  )
}
