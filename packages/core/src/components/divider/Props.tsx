import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DividerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="方向">
        <w.Select
          value={(values.type as string) ?? 'horizontal'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '水平', value: 'horizontal' },
            { label: '垂直', value: 'vertical' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="文字位置">
        <w.Select
          value={(values.orientation as string) ?? 'center'}
          onChange={(v) => onChange('orientation', v)}
          options={[
            { label: '居中', value: 'center' },
            { label: '左侧', value: 'left' },
            { label: '右侧', value: 'right' },
          ]}
        />
      </FieldGroup>
      <InlineField label="简单模式">
        <w.Checkbox checked={!!values.plain} onChange={(v) => onChange('plain', v)} />
      </InlineField>
      <FieldGroup label="文字内容">
        <w.Input value={(values.children as string) ?? ''} onChange={(v) => onChange('children', v)} placeholder="分割线中的文字" />
      </FieldGroup>
    </>
  )
}
