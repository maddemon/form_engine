import React from 'react'
import { Upload as AntUpload, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useLocale } from '@form-engine/core/locale'
import type { UploadProps, UploadFile } from '@form-engine/core'
import type { UploadChangeParam } from 'antd/es/upload'

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
  const { locale } = useLocale()
  const handleChange = (info: UploadChangeParam) => {
    const fileList: UploadFile[] = info.fileList.map(
      (file) =>
        ({
          uid: file.uid,
          name: file.name,
          status: file.status as UploadFile['status'],
          url: file.url,
        }) as UploadFile,
    )
    const currentFile: UploadFile = {
      uid: info.file.uid,
      name: info.file.name,
      status: info.file.status as UploadFile['status'],
      url: info.file.url,
    } as UploadFile
    onChange?.({ file: currentFile, fileList })
  }

  const isCard = listType === 'picture-card'

  return (
    <AntUpload
      action={action}
      accept={accept}
      maxCount={maxCount}
      listType={isCard ? 'picture-card' : 'text'}
      multiple={multiple}
      directory={directory as boolean | undefined}
      showUploadList={isCard || showUploadList}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      onChange={handleChange}
      {...rest}
    >
      {(children as React.ReactNode) || (isCard ? (
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
        <Button disabled={disabled} icon={<UploadOutlined />}>{locale.adapter.antd.upload.button}</Button>
      ))}
    </AntUpload>
  )
}
