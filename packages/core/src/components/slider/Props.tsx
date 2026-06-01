import { FieldGroup, RowField, PropsRenderProps } from '../../propRenders'

export default function SliderPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder="如: 30 或 [20,80]" />
      </RowField>
      <RowField label="最小值">
        <w.NumberInput value={(values.min as number) ?? 0} onChange={(v) => onChange('min', v)} />
      </RowField>
      <RowField label="最大值">
        <w.NumberInput value={(values.max as number) ?? 100} onChange={(v) => onChange('max', v)} />
      </RowField>
      <RowField label="步长">
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </RowField>
      <RowField label="Tooltip 格式化">
        <w.Input value={(values.tooltip as any)?.formatter as string ?? ''} onChange={(v) => onChange('tooltip', v ? { formatter: v } : undefined)} placeholder="如: {value}%" />
      </RowField>
    </>
  )
}