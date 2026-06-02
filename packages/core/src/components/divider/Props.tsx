import { FieldGroup, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DividerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="方向">
        <w.ButtonGroup
          value={(values.type as string) ?? 'horizontal'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '水平', value: 'horizontal' },
            { label: '垂直', value: 'vertical' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="文字位置">
        <w.ButtonGroup
          value={(values.orientation as string) ?? 'center'}
          onChange={(v) => onChange('orientation', v)}
          options={[
            { label: '居中', value: 'center' },
            { label: '左侧', value: 'left' },
            { label: '右侧', value: 'right' },
          ]}
        />
      </FieldGroup>
      <RowField label="简单模式">
        <w.Switch checked={!!values.plain} onChange={(v) => onChange('plain', v)} />
      </RowField>
      <RowField label="文字内容">
        <w.Input value={(values.children as string) ?? ''} onChange={(v) => onChange('children', v)} placeholder="分割线中的文字" />
      </RowField>
      <RowField label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #ddd" />
      </RowField>
      <RowField label="粗细">
        <w.NumberInput value={(values.thickness as number) ?? 1} onChange={(v) => onChange('thickness', v)} min={0} max={10} />
      </RowField>
    </>
  )
}
