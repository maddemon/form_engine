import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TitlePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="标题内容">
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder="输入标题" />
      </FieldItem>
      <FieldItem label="级别">
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
      <FieldItem label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #333" />
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
      <FieldItem label="标记">
        <w.Switch checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </FieldItem>
    </>
  )
}
