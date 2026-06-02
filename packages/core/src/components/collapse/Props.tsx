import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="手风琴模式">
        <w.Switch checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </FieldItem>
      <FieldItem label="简洁模式">
        <w.Switch checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </FieldItem>
      <FieldItem label="默认展开Key">
        <w.Input value={(values.defaultActiveKey as string) ?? ''} onChange={(v) => onChange('defaultActiveKey', v)} placeholder="面板的key，多个用逗号分隔" />
      </FieldItem>
    </>
  )
}
