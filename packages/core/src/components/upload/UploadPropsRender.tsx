import { FieldItem, PropsRenderProps } from '../../propRenders'

const LIST_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '图片', value: 'picture' },
  { label: '卡片', value: 'picture-card' },
]

export default function UploadPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="上传地址">
        <w.Input value={(values.action as string) ?? ''} onChange={(v) => onChange('action', v)} placeholder="如: https://api.example.com/upload" />
      </FieldItem>
      <FieldItem label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} />
      </FieldItem>
      <FieldItem label="接受文件类型">
        <w.Input value={(values.accept as string) ?? ''} onChange={(v) => onChange('accept', v)} />
      </FieldItem>
      <FieldItem label="最大数量">
        <w.NumberInput value={(values.maxCount as number) ?? 1} onChange={(v) => onChange('maxCount', v)} min={1} />
      </FieldItem>
      <FieldItem label="列表类型">
        <w.ButtonGroup value={(values.listType as string) ?? 'text'} onChange={(v) => onChange('listType', v)} options={LIST_TYPE_OPTIONS} />
      </FieldItem>
      <FieldItem label="多文件">
        <w.Switch checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </FieldItem>
      <FieldItem label="显示上传列表">
        <w.Switch checked={values.showUploadList !== false} onChange={(v) => onChange('showUploadList', v)} />
      </FieldItem>
      <FieldItem label="文件夹上传">
        <w.Switch checked={!!values.directory} onChange={(v) => onChange('directory', v)} />
      </FieldItem>
      <FieldItem label="上传前置处理">
        <w.Input value={(values.beforeUpload as string) ?? ''} onChange={(v) => onChange('beforeUpload', v)} placeholder="函数体，如: return file.size < 1024" />
      </FieldItem>
    </>
  )
}
