import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TreeSelectPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请选择" />
      </FieldItem>
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label="可搜索">
        <w.Switch checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </FieldItem>
      <FieldItem label="多选">
        <w.Switch checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </FieldItem>
      <FieldItem label="树勾选">
        <w.Switch checked={!!values.treeCheckable} onChange={(v) => onChange('treeCheckable', v)} />
      </FieldItem>
    </>
  )
}
