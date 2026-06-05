import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TextPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="文本内容">
        <w.TextArea value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="输入文本内容" />
      </FieldItem>
      <FieldItem label="类型">
        <w.Select
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
      </FieldItem>
      <FieldItem label="字号">
        <w.Input value={(values.fontSize as string) ?? ''} onChange={(v) => onChange('fontSize', v ? Number(v) : undefined)} placeholder="如: 16" />
      </FieldItem>
      <FieldItem label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #333" />
      </FieldItem>
      <FieldItem label="对齐方式">
        <w.ButtonGroup
          value={(values.textAlign as string) ?? 'left'}
          onChange={(v) => onChange('textAlign', v)}
          options={[
            { label: '左', value: 'left' },
            { label: '中', value: 'center' },
            { label: '右', value: 'right' },
          ]}
        />
      </FieldItem>
      <FieldItem label="键盘样式">
        <w.Switch checked={!!values.keyboard} onChange={(v) => onChange('keyboard', v)} />
      </FieldItem>
      <FieldItem label="加粗">
        <w.Switch checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </FieldItem>
      <FieldItem label="斜体">
        <w.Switch checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </FieldItem>
      <FieldItem label="下划线">
        <w.Switch checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </FieldItem>
      <FieldItem label="删除线">
        <w.Switch checked={!!values.delete} onChange={(v) => onChange('delete', v)} />
      </FieldItem>
      <FieldItem label="代码">
        <w.Switch checked={!!values.code} onChange={(v) => onChange('code', v)} />
      </FieldItem>
      <FieldItem label="标记">
        <w.Switch checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </FieldItem>
      <FieldItem label="省略溢出">
        <w.Switch checked={!!values.ellipsis} onChange={(v) => onChange('ellipsis', v)} />
      </FieldItem>
    </>
  )
}
