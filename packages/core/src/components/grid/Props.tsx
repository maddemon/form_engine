import { FieldItem, ItemListEditor, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'

export default function GridPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const colSpans = (values.colSpans as Array<{ id: string; span: number }>) ?? []

  return (
    <>
      <FieldItem label="布局模式">
        <w.Select value={(values.variant as string) ?? 'grid'} onChange={(v) => onChange('variant', v)} options={[
          { label: '栅格', value: 'grid' },
          { label: '弹性', value: 'flex' },
        ]} />
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
      <FieldItem label="列管理" variant="group">
        <ItemListEditor<{ id: string; span: number }>
          value={colSpans}
          onChange={(v) => onChange('colSpans', v)}
          fields={[
            { key: 'span', label: '宽度', kind: 'number', min: 1, max: 24, step: 1, placeholder: '1-24' },
          ]}
          newItem={() => ({ id: genId('col'), span: 8 })}
          validateTotal={(items) => {
            const sum = items.reduce((s, x) => s + (Number(x.span) || 0), 0)
            if (sum > 24) return `列宽总和 ${sum} 超过 24`
            return null
          }}
          minItems={1}
          addLabel="添加列"
          layout="table"
          widgets={{ Input: w.Input, NumberInput: w.NumberInput, Switch: w.Switch }}
        />
      </FieldItem>
    </>
  )
}