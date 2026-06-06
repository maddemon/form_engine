import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function TextAreaPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const autoSizeValue = values.autoSize
  const isAutoSize = autoSizeValue === true || (typeof autoSizeValue === 'object' && autoSizeValue !== null)

  return (
    <>
      <FieldItem label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldItem>
      <FieldItem label="行数">
        <w.NumberInput value={(values.rows as number) ?? 4} onChange={(v) => onChange('rows', v)} min={1} max={20} />
      </FieldItem>
      <FieldItem label="自适应高度">
        <w.Switch checked={isAutoSize} onChange={(v) => onChange('autoSize', v ? true : undefined)} />
      </FieldItem>
      {isAutoSize && (
        <>
          <FieldItem label="最小行数">
            <w.NumberInput value={(autoSizeValue as Record<string, number>)?.minRows ?? 1} onChange={(v) => onChange('autoSize', { ...(typeof autoSizeValue === 'object' ? autoSizeValue : {}), minRows: v })} min={1} />
          </FieldItem>
          <FieldItem label="最大行数">
            <w.NumberInput value={(autoSizeValue as Record<string, number>)?.maxRows ?? 6} onChange={(v) => onChange('autoSize', { ...(typeof autoSizeValue === 'object' ? autoSizeValue : {}), maxRows: v })} min={1} />
          </FieldItem>
        </>
      )}
      <FieldItem label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldItem>
    </>
  )
}
