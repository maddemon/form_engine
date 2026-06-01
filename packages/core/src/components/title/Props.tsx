import { FieldGroup, InlineField, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TitlePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="标题内容">
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="输入标题" />
      </FieldGroup>
      <FieldGroup label="级别">
        <w.ButtonGroup
          value={String((values.level as number) ?? 1)}
          onChange={(v) => onChange('level', Number(v))}
          options={[
            { label: 'H1', value: '1' },
            { label: 'H2', value: '2' },
            { label: 'H3', value: '3' },
            { label: 'H4', value: '4' },
            { label: 'H5', value: '5' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="对齐方式">
        <w.ButtonGroup
          value={(values.align as string) ?? 'left'}
          onChange={(v) => onChange('align', v)}
          options={[
            { label: '左', value: 'left' },
            { label: '中', value: 'center' },
            { label: '右', value: 'right' },
          ]}
        />
      </FieldGroup>
      <RowField label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #333" />
      </RowField>
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
