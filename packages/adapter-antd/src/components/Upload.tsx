import React from 'react'
import { Upload as AntUpload, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps, UploadFile } from '@form-engine/core'

export const Upload: React.FC<UploadProps> = ({
  value,
  onChange,
  action,
  accept,
  maxCount,
  listType = 'text',
  multiple = (maxCount ?? 1) > 1,
  directory,
  showUploadList = true,
  disabled,
  style,
  className,
  id,
  children,
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

  const isCard = listType === 'picture-card'

  return (
    <AntUpload
      action={action}
      accept={accept}
      maxCount={maxCount}
      listType={isCard ? 'picture-card' : 'text'}
      multiple={multiple}
      directory={directory}
      showUploadList={isCard || showUploadList}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      onChange={handleChange}
      {...rest}
    >
      {children || (isCard ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'var(--fe-text-tertiary, #999)',
          }}
        >
          +
        </div>
      ) : (
        <Button disabled={disabled} icon={<UploadOutlined />}>上传文件</Button>
      ))}
    </AntUpload>
  )
}
