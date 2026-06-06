import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DividerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="方向">
        <w.ButtonGroup
          value={(values.type as string) ?? 'horizontal'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '水平', value: 'horizontal' },
            { label: '垂直', value: 'vertical' },
          ]}
        />
      </FieldItem>
      <FieldItem label="文字位置">
        <w.ButtonGroup
          value={(values.textPlacement as string) ?? 'center'}
          onChange={(v) => onChange('textPlacement', v)}
          options={[
            { label: '居中', value: 'center' },
            { label: '左侧', value: 'left' },
            { label: '右侧', value: 'right' },
          ]}
        />
      </FieldItem>
      <FieldItem label="简单模式">
        <w.Switch checked={!!values.plain} onChange={(v) => onChange('plain', v)} />
      </FieldItem>
      <FieldItem label="文字内容">
        <w.Input
          value={(values.children as string) ?? ''}
          onChange={(v) => onChange('children', v)}
          placeholder="分割线中的文字"
        />
      </FieldItem>
      <FieldItem label="颜色">
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder="如: #ddd" />
      </FieldItem>
      <FieldItem label="粗细">
        <w.NumberInput
          value={(values.thickness as number) ?? 1}
          onChange={(v) => onChange('thickness', v)}
          min={0}
          max={10}
        />
      </FieldItem>
    </>
  )
}
