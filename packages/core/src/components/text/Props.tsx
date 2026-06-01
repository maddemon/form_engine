import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TextPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="文本内容">
        <w.TextArea value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="输入文本内容" />
      </FieldGroup>
      <FieldGroup label="类型">
        <w.ButtonGroup
          value={(values.type as string) ?? ''}
          onChange={(v) => onChange('type', v || undefined)}
          options={[
            { label: '默认', value: '' },
            { label: '次要', value: 'secondary' },
            { label: '成功', value: 'success' },
            { label: '警告', value: 'warning' },
            { label: '危险', value: 'danger' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="字号">
        <w.Input value={(values.fontSize as string) ?? ''} onChange={(v) => onChange('fontSize', v ? Number(v) : undefined)} placeholder="如: 16" />
      </FieldGroup>
      <FieldGroup label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #333" />
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
      <InlineField label="键盘样式">
        <w.Checkbox checked={!!values.keyboard} onChange={(v) => onChange('keyboard', v)} />
      </InlineField>
      <InlineField label="加粗">
        <w.Checkbox checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </InlineField>
      <InlineField label="斜体">
        <w.Checkbox checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </InlineField>
      <InlineField label="下划线">
        <w.Checkbox checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </InlineField>
      <InlineField label="删除线">
        <w.Checkbox checked={!!values.delete} onChange={(v) => onChange('delete', v)} />
      </InlineField>
      <InlineField label="代码">
        <w.Checkbox checked={!!values.code} onChange={(v) => onChange('code', v)} />
      </InlineField>
      <InlineField label="标记">
        <w.Checkbox checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </InlineField>
      <InlineField label="省略溢出">
        <w.Checkbox checked={!!values.ellipsis} onChange={(v) => onChange('ellipsis', v)} />
      </InlineField>
    </>
  )
}
