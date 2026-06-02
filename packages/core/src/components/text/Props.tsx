import { FieldGroup, RowField } from '../../propRenders/shared'
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
      <RowField label="字号">
        <w.Input value={(values.fontSize as string) ?? ''} onChange={(v) => onChange('fontSize', v ? Number(v) : undefined)} placeholder="如: 16" />
      </RowField>
      <RowField label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #333" />
      </RowField>
      <RowField label="对齐方式">
        <w.ButtonGroup
          value={(values.align as string) ?? 'left'}
          onChange={(v) => onChange('align', v)}
          options={[
            { label: '左', value: 'left' },
            { label: '中', value: 'center' },
            { label: '右', value: 'right' },
          ]}
        />
      </RowField>
      <RowField label="键盘样式">
        <w.Switch checked={!!values.keyboard} onChange={(v) => onChange('keyboard', v)} />
      </RowField>
      <RowField label="加粗">
        <w.Switch checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </RowField>
      <RowField label="斜体">
        <w.Switch checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </RowField>
      <RowField label="下划线">
        <w.Switch checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </RowField>
      <RowField label="删除线">
        <w.Switch checked={!!values.delete} onChange={(v) => onChange('delete', v)} />
      </RowField>
      <RowField label="代码">
        <w.Switch checked={!!values.code} onChange={(v) => onChange('code', v)} />
      </RowField>
      <RowField label="标记">
        <w.Switch checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </RowField>
      <RowField label="省略溢出">
        <w.Switch checked={!!values.ellipsis} onChange={(v) => onChange('ellipsis', v)} />
      </RowField>
    </>
  )
}
