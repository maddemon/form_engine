import React, { useRef, useState } from 'react'
import type { UploadProps, UploadFile } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Upload 组件（默认实现）
 * Ant Design 风格
 */
export const Upload: React.FC<UploadProps> = ({
  value,
  onChange,
  accept,
  multiple = false,
  maxCount,
  disabled,
  showUploadList = true,
  listType = 'text',
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const { token } = useStyle()

  const fileList = Array.isArray(value) ? value : []

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const files = e.target.files
    if (!files) return

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      uid: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      status: 'done' as const,
      url: URL.createObjectURL(file),
      originFile: file,
    }))

    let updatedList = multiple ? [...fileList, ...newFiles] : newFiles

    if (maxCount && updatedList.length > maxCount) {
      updatedList = updatedList.slice(0, maxCount)
    }

    onChange?.(multiple ? updatedList : updatedList[0])

    // 清空 input 以允许再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (uid: string) => {
    if (disabled) return
    const updatedList = fileList.filter(file => file.uid !== uid)
    onChange?.(multiple ? updatedList : undefined)
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    ...propsStyle,
  }

  // 上传按钮/拖拽区域样式
  const uploadAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${token('spacingLg')} ${token('spacingXl')}`,
    border: `2px dashed ${dragActive ? token('primary') as string : token('borderPrimary') as string}`,
    borderRadius: token('borderRadiusMd') as string,
    background: dragActive ? token('primaryBg') as string : token('uploadDraggerBg') as string || '#fafafa',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color 0.2s, background-color 0.2s',
    textAlign: 'center',
    ...(disabled ? {} : {
      ':hover': {
        borderColor: token('primaryHover') as string,
      },
    }),
  }

  const buttonStyle: React.CSSProperties = {
    padding: `${token('spacingXs')} ${token('spacingMd')}`,
    background: token('primary') as string,
    color: '#fff',
    border: 'none',
    borderRadius: token('borderRadiusSm') as string,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: token('fontSizeMd') as number,
    transition: `background-color 0.2s`,
    ...(disabled ? {} : {
      ':hover': {
        background: token('primaryHover') as string,
      },
    }),
  }

  // 文件列表样式
  const fileListStyle: React.CSSProperties = {
    marginTop: token('spacingMd') as number,
  }

  const fileItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${token('spacingXs')} ${token('spacingSm')}`,
    marginBottom: token('spacingXs') as number,
    background: token('uploadListItemBg') as string || '#fafafa',
    borderRadius: token('borderRadiusSm') as string,
    fontSize: token('fontSizeSm') as number,
    color: token('textPrimary') as string,
    transition: 'background-color 0.2s',
    ...(disabled ? {} : {
      ':hover': {
        background: token('bgSecondary') as string,
      },
    }),
  }

  return (
    <div id={id} className={className} style={containerStyle} {...rest}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {/* 拖拽上传区域 */}
      <div
        style={uploadAreaStyle}
        onClick={handleClick}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          // 处理拖拽文件
          if (disabled) return
          const files = e.dataTransfer.files
          if (!files) return

          const newFiles: UploadFile[] = Array.from(files).map(file => ({
            uid: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            status: 'done' as const,
            url: URL.createObjectURL(file),
            originFile: file,
          }))

          let updatedList = multiple ? [...fileList, ...newFiles] : newFiles
          if (maxCount && updatedList.length > maxCount) {
            updatedList = updatedList.slice(0, maxCount)
          }
          onChange?.(multiple ? updatedList : updatedList[0])
        }}
      >
        {/* 上传图标 */}
        <div style={{ fontSize: '48px', color: token('textTertiary') as string, marginBottom: token('spacingSm') as number }}>
          📁
        </div>
        <div style={{ marginBottom: token('spacingXs') as number, fontSize: token('fontSizeMd') as number, color: token('textPrimary') as string }}>
          <span style={buttonStyle}>
            点击上传
          </span>
        </div>
        <div style={{ fontSize: token('fontSizeSm') as number, color: token('textTertiary') as string }}>
          或者拖拽文件到此区域
        </div>
      </div>

      {/* 文件列表 */}
      {showUploadList && fileList.length > 0 && (
        <div style={fileListStyle}>
          {fileList.map(file => (
            <div key={file.uid} style={fileItemStyle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') as number }}>
                <span>📄</span>
                <span>{file.name}</span>
                {file.status === 'uploading' && <span style={{ color: token('primary') as string }}>上传中...</span>}
                {file.status === 'done' && <span style={{ color: token('success') as string }}>✓</span>}
                {file.status === 'error' && <span style={{ color: token('error') as string }}>✗</span>}
              </span>
              {!disabled && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleRemove(file.uid) }}
                  style={{ cursor: 'pointer', color: token('error') as string, fontSize: token('fontSizeSm') as number }}
                >
                  删除
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
