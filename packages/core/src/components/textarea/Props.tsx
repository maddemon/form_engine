import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function TextAreaPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="行数">
        <w.NumberInput value={(values.rows as number) ?? 4} onChange={(v) => onChange('rows', v)} min={1} max={20} />
      </FieldGroup>
      <FieldGroup label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldGroup>
      <InlineField label="显示字数">
        <w.Checkbox checked={!!values.showCount} onChange={(v) => onChange('showCount', v)} />
      </InlineField>
      <InlineField label="自适应高度">
        <w.Checkbox checked={!!values.autoSize} onChange={(v) => onChange('autoSize', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
    </>
  )
}
