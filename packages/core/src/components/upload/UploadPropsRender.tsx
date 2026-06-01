import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function UploadPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="接受文件类型">
        <w.Input value={(values.accept as string) ?? ''} onChange={(v) => onChange('accept', v)} />
      </FieldGroup>
      <FieldGroup label="最大数量">
        <w.NumberInput value={(values.maxCount as number) ?? 1} onChange={(v) => onChange('maxCount', v)} min={1} />
      </FieldGroup>
      <FieldGroup label="列表类型">
        <w.Select
          value={(values.listType as string) ?? 'text'}
          onChange={(v) => onChange('listType', v)}
          options={[
            { label: '文本', value: 'text' },
            { label: '图片', value: 'picture' },
            { label: '卡片', value: 'picture-card' },
          ]}
        />
      </FieldGroup>
      <InlineField label="多文件">
        <w.Checkbox checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </InlineField>
      <InlineField label="显示上传列表">
        <w.Checkbox checked={values.showUploadList !== false} onChange={(v) => onChange('showUploadList', v)} />
      </InlineField>
    </>
  )
}
