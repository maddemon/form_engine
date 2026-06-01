import { RowField, PropsRenderProps } from '../../propRenders'

export default function InputNumberPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="最小值">
        <w.NumberInput value={(values.min as number) ?? undefined} onChange={(v) => onChange('min', v)} />
      </RowField>
      <RowField label="最大值">
        <w.NumberInput value={(values.max as number) ?? undefined} onChange={(v) => onChange('max', v)} />
      </RowField>
      <RowField label="步长">
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </RowField>
      <RowField label="精度">
        <w.NumberInput value={(values.precision as number) ?? undefined} onChange={(v) => onChange('precision', v)} min={0} max={20} />
      </RowField>
      <RowField label="前缀">
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder="如：¥" />
      </RowField>
      <RowField label="后缀">
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} placeholder="如：%" />
      </RowField>
    </>
  )
}