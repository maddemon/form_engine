import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function GridPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="列数">
        <w.NumberInput value={(values.columns as number) ?? 24} onChange={(v) => onChange('columns', v)} min={1} max={48} />
      </FieldGroup>
      <FieldGroup label="间距">
        <w.NumberInput value={(values.gap as number) ?? 8} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </FieldGroup>
    </>
  )
}
