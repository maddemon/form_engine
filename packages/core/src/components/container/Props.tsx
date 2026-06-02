import { FieldGroup, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ContainerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="布局方向">
        <w.ButtonGroup
          value={(values.layout as string) ?? 'vertical'}
          onChange={(v) => onChange('layout', v)}
          options={[
            { label: '垂直', value: 'vertical' },
            { label: '水平', value: 'horizontal' },
          ]}
        />
      </FieldGroup>
      <RowField label="自动换行">
        <w.Switch checked={!!values.wrap} onChange={(v) => onChange('wrap', v)} />
      </RowField>
      <RowField label="背景色">
        <w.Input value={(values.background as string) ?? ''} onChange={(v) => onChange('background', v)} placeholder="如：#f5f5f5" />
      </RowField>
      <RowField label="圆角">
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </RowField>
      <RowField label="最小高度(px)">
        <w.NumberInput value={(values.minHeight as number) ?? 0} onChange={(v) => onChange('minHeight', v)} min={0} max={2000} />
      </RowField>
      <RowField label="内边距(px)">
        <w.NumberInput value={(values.padding as number) ?? 0} onChange={(v) => onChange('padding', v)} min={0} max={200} />
      </RowField>
      <RowField label="外边距(px)">
        <w.NumberInput value={(values.margin as number) ?? 0} onChange={(v) => onChange('margin', v)} min={0} max={200} />
      </RowField>
      <RowField label="间距(px)">
        <w.NumberInput value={(values.gap as number) ?? 0} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </RowField>
    </>
  )
}
