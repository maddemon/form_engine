import { useCallback } from 'react'
import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor, WidgetButton } from '../../widgets'

interface ColSpanItem {
  id: string
  span: number
}

function normalizeSpans(items: ColSpanItem[]): ColSpanItem[] {
  const sum = items.reduce((s, x) => s + (Number(x.span) || 0), 0)
  if (sum <= 24 || items.length === 0) return items
  const result = items.map((x) => ({ ...x, span: Math.max(1, Math.floor(((Number(x.span) || 1) * 24) / sum)) }))
  const newSum = result.reduce((s, x) => s + x.span, 0)
  let diff = newSum - 24
  for (let i = result.length - 1; diff > 0 && i >= 0; i--) {
    const delta = Math.min(diff, result[i].span - 1)
    result[i] = { ...result[i], span: result[i].span - delta }
    diff -= delta
  }
  return result
}

export default function GridPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const colSpans = (values.colSpans as ColSpanItem[]) ?? []

  const handleColSpansChange = useCallback((v: ColSpanItem[]) => onChange('colSpans', normalizeSpans(v)), [onChange])

  const handleAddCol = useCallback(() => {
    onChange('colSpans', normalizeSpans([...colSpans, { id: genId('col'), span: 8 }]))
  }, [colSpans, onChange])

  return (
    <>
      <FieldItem label="布局模式">
        <w.Select
          value={(values.variant as string) ?? 'grid'}
          onChange={(v) => onChange('variant', v)}
          options={[
            { label: '栅格', value: 'grid' },
            { label: '弹性', value: 'flex' },
          ]}
        />
      </FieldItem>
      <FieldItem label="间距">
        <w.NumberInput value={(values.gap as number) ?? 8} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </FieldItem>
      <FieldItem label="内边距(px)">
        <w.NumberInput
          value={(values.padding as number) ?? 0}
          onChange={(v) => onChange('padding', v)}
          min={0}
          max={200}
        />
      </FieldItem>
      <FieldItem label="外边距(px)">
        <w.NumberInput
          value={(values.margin as number) ?? 0}
          onChange={(v) => onChange('margin', v)}
          min={0}
          max={200}
        />
      </FieldItem>
      <FieldItem label="列管理" variant="group">
        <SortableTableEditor<ColSpanItem>
          value={colSpans}
          onChange={handleColSpansChange}
          columns={[
            {
              key: 'span',
              label: '宽度',
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.NumberInput
                  value={value as number | undefined}
                  disabled={d}
                  min={1}
                  max={24}
                  variant="filled"
                  onChange={(v) => onValChange(v)}
                />
              ),
            },
          ]}
          minItems={1}
        />
        <WidgetButton
          type="dashed"
          color="primary"
          size="sm"
          onClick={handleAddCol}
          style={{ width: '100%', marginTop: 4 }}
        >
          + 添加列
        </WidgetButton>
      </FieldItem>
    </>
  )
}
