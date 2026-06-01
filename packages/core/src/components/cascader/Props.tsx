import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function CascaderPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
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
      <FieldGroup label="展开触发">
        <w.ButtonGroup
          value={(values.expandTrigger as string) ?? 'click'}
          onChange={(v) => onChange('expandTrigger', v)}
          options={[
            { label: '点击', value: 'click' },
            { label: '悬停', value: 'hover' },
          ]}
        />
      </FieldGroup>
    </>
  )
}