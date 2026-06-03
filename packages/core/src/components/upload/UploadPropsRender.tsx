import { FieldItem, PropsRenderProps } from '../../propRenders'

const LIST_TYPE_OPTIONS = [
  { label: '列表', value: 'text' },
  { label: '卡片', value: 'picture-card' },
]

export default function UploadPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const isCard = (values.listType as string) === 'picture-card'

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
      {!isCard && (
        <FieldItem label="显示上传列表">
          <w.Switch checked={values.showUploadList !== false} onChange={(v) => onChange('showUploadList', v)} />
        </FieldItem>
      )}
    </>
  )
}
