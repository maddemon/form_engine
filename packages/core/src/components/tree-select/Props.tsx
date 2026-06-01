import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TreeSelectPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请选择" />
      </FieldGroup>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
      <InlineField label="可搜索">
        <w.Checkbox checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </InlineField>
      <InlineField label="多选">
        <w.Checkbox checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </InlineField>
      <InlineField label="树勾选">
        <w.Checkbox checked={!!values.treeCheckable} onChange={(v) => onChange('treeCheckable', v)} />
      </InlineField>
    </>
  )
}