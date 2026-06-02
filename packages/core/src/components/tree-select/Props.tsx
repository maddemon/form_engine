import { FieldGroup, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TreeSelectPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请选择" />
      </FieldGroup>
      <RowField label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </RowField>
      <RowField label="可搜索">
        <w.Switch checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </RowField>
      <RowField label="多选">
        <w.Switch checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </RowField>
      <RowField label="树勾选">
        <w.Switch checked={!!values.treeCheckable} onChange={(v) => onChange('treeCheckable', v)} />
      </RowField>
    </>
  )
}