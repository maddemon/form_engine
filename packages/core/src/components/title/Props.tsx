import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TitlePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="标题内容">
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="输入标题" />
      </FieldGroup>
      <FieldGroup label="级别">
        <w.Select
          value={(values.level as number) ?? 1}
          onChange={(v) => onChange('level', v)}
          options={[
            { label: 'H1', value: 1 },
            { label: 'H2', value: 2 },
            { label: 'H3', value: 3 },
            { label: 'H4', value: 4 },
            { label: 'H5', value: 5 },
          ]}
        />
      </FieldGroup>
      <InlineField label="加粗">
        <w.Checkbox checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </InlineField>
      <InlineField label="斜体">
        <w.Checkbox checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </InlineField>
      <InlineField label="下划线">
        <w.Checkbox checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </InlineField>
      <InlineField label="标记">
        <w.Checkbox checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </InlineField>
    </>
  )
}
