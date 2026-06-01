import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <InlineField label="手风琴模式">
        <w.Checkbox checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </InlineField>
      <InlineField label="简洁模式">
        <w.Checkbox checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </InlineField>
    </>
  )
}
