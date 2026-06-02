import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function TextAreaPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldItem>
      <FieldItem label="行数">
        <w.NumberInput value={(values.rows as number) ?? 4} onChange={(v) => onChange('rows', v)} min={1} max={20} />
      </FieldItem>
      <FieldItem label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldItem>
    </>
  )
}
