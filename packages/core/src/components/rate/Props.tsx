import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function RatePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="星数">
        <w.NumberInput value={(values.count as number) ?? 5} onChange={(v) => onChange('count', v)} min={1} max={10} />
      </FieldGroup>
      <InlineField label="允许半选">
        <w.Checkbox checked={!!values.allowHalf} onChange={(v) => onChange('allowHalf', v)} />
      </InlineField>
    </>
  )
}
