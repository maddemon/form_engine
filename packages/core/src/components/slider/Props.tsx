import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function SliderPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="最小值">
        <w.NumberInput value={(values.min as number) ?? 0} onChange={(v) => onChange('min', v)} />
      </FieldGroup>
      <FieldGroup label="最大值">
        <w.NumberInput value={(values.max as number) ?? 100} onChange={(v) => onChange('max', v)} />
      </FieldGroup>
      <FieldGroup label="步长">
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </FieldGroup>
      <InlineField label="范围">
        <w.Checkbox checked={!!values.range} onChange={(v) => onChange('range', v)} />
      </InlineField>
      <InlineField label="竖排">
        <w.Checkbox checked={!!values.vertical} onChange={(v) => onChange('vertical', v)} />
      </InlineField>
      <InlineField label="刻度点">
        <w.Checkbox checked={!!values.dots} onChange={(v) => onChange('dots', v)} />
      </InlineField>
      <FieldGroup label="刻度标记 (JSON)">
        <w.Input value={values.marks ? JSON.stringify(values.marks) : ''} onChange={(v) => onChange('marks', v ? JSON.parse(v as string) : undefined)} placeholder='{"0":"0%","50":"50%","100":"100%"}' />
      </FieldGroup>
    </>
  )
}
