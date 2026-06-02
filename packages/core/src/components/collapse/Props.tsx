import { FieldGroup, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="手风琴模式">
        <w.Switch checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </RowField>
      <RowField label="简洁模式">
        <w.Switch checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </RowField>
      <FieldGroup label="默认展开Key">
        <w.Input value={(values.defaultActiveKey as string) ?? ''} onChange={(v) => onChange('defaultActiveKey', v)} placeholder="面板的key，多个用逗号分隔" />
      </FieldGroup>
    </>
  )
}
