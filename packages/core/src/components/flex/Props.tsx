import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function FlexPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="方向">
        <w.Select
          value={(values.direction as string) ?? 'row'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: '水平', value: 'row' },
            { label: '水平反序', value: 'row-reverse' },
            { label: '垂直', value: 'column' },
            { label: '垂直反序', value: 'column-reverse' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="主轴对齐">
        <w.Select
          value={(values.justify as string) ?? 'flex-start'}
          onChange={(v) => onChange('justify', v)}
          options={[
            { label: '起始', value: 'flex-start' },
            { label: '居中', value: 'center' },
            { label: '末端', value: 'flex-end' },
            { label: '均匀分布', value: 'space-between' },
            { label: '环绕', value: 'space-around' },
            { label: '等距', value: 'space-evenly' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="交叉轴对齐">
        <w.Select
          value={(values.align as string) ?? 'stretch'}
          onChange={(v) => onChange('align', v)}
          options={[
            { label: '拉伸', value: 'stretch' },
            { label: '起始', value: 'flex-start' },
            { label: '居中', value: 'center' },
            { label: '末端', value: 'flex-end' },
            { label: '基线', value: 'baseline' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="间距">
        <w.NumberInput value={(values.gap as number) ?? 0} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </FieldGroup>
    </>
  )
}
