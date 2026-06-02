import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

const GRID_VARIANT_OPTIONS = [
  { label: '栅格', value: 'grid' },
  { label: '弹性', value: 'flex' },
]

export default function GridPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="布局模式">
        <w.Select value={(values.variant as string) ?? 'grid'} onChange={(v) => onChange('variant', v)} options={GRID_VARIANT_OPTIONS} />
      </FieldItem>
      <FieldItem label="列数">
        <w.NumberInput value={(values.columns as number) ?? 24} onChange={(v) => onChange('columns', v)} min={1} max={48} />
      </FieldItem>
      <FieldItem label="间距">
        <w.NumberInput value={(values.gap as number) ?? 8} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </FieldItem>
      <FieldItem label="内边距(px)">
        <w.NumberInput value={(values.padding as number) ?? 0} onChange={(v) => onChange('padding', v)} min={0} max={200} />
      </FieldItem>
      <FieldItem label="外边距(px)">
        <w.NumberInput value={(values.margin as number) ?? 0} onChange={(v) => onChange('margin', v)} min={0} max={200} />
      </FieldItem>
    </>
  )
}
