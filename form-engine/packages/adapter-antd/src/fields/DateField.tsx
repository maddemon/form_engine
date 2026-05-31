import { DatePicker, TimePicker, Upload, Button, Cascader, TreeSelect } from 'antd'
import type { FieldRendererFn, FieldComponentProps } from '../../../types/adapter'
import { PlusOutlined } from '@ant-design/icons'
import type { OptionItem } from '../../../types/schema'

const { RangePicker } = DatePicker

// ----- Date / Datetime -----
export const DateField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const showTime = fieldSchema.componentProps?.showTime
  const picker = (fieldSchema.componentProps?.picker as any) || 'date'
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <DatePicker
      value={value ? (typeof value === 'string' ? value : undefined) : undefined}
      onChange={(_date: any, dateString: string) => onChange?.(dateString)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      picker={picker}
      showTime={showTime}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}

// ----- DateRange -----
export const DateRangeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <RangePicker
      value={value ? (value as [string, string]) : undefined}
      onChange={(_dates: any, dateStrings: [string, string]) => onChange?.(dateStrings)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder ? [fieldSchema.placeholder, '结束日期'] : undefined}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}

// ----- Time -----
export const TimeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const style = (props as any).style as React.CSSProperties | undefined
  return (
    <TimePicker
      value={value as string ?? undefined}
      onChange={(_time: any, timeString: string) => onChange?.(timeString)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}

// ----- Upload -----
export const UploadField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const accept = (fieldSchema.componentProps?.accept as string) || ''
  const maxCount = (fieldSchema.componentProps?.maxCount as number) || 5
  const isImage = !accept || accept.includes('image')

  const fileList = ((value as string[]) || []).map((url, idx) => ({
    uid: String(idx),
    name: url.split('/').pop() || `file-${idx}`,
    status: 'done' as const,
    url,
  }))

  return (
    <Upload
      listType={isImage ? 'picture-card' : 'text'}
      action={fieldSchema.componentProps?.action as string}
      fileList={fileList}
      onChange={info => {
        const urls = info.fileList
          .filter(f => f.status === 'done')
          .map(f => f.response?.url || f.url || f.name)
        onChange?.(urls)
      }}
      accept={accept}
      maxCount={maxCount}
      disabled={disabled}
    >
      {fileList.length < maxCount && (
        <Button icon={<PlusOutlined />} disabled={disabled}>
          上传
        </Button>
      )}
    </Upload>
  )
}

// ----- Cascader -----
export const CascaderField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const style = (props as any).style as React.CSSProperties | undefined
  const cascaderOptions = (options || []) as OptionItem[]
  return (
    <Cascader
      value={value as string[] ?? undefined}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      options={cascaderOptions}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}

// ----- TreeSelect -----
export const TreeSelectField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const style = (props as any).style as React.CSSProperties | undefined
  const treeData = (options || []) as OptionItem[]
  return (
    <TreeSelect
      value={value as string ?? undefined}
      onChange={v => onChange?.(v)}
      disabled={disabled}
      placeholder={fieldSchema.placeholder}
      treeData={treeData as any}
      style={{ width: '100%', ...(style || {}) }}
    />
  )
}
