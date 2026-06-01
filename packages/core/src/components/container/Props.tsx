import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ContainerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="布局方向">
        <w.Select
          value={(values.layout as string) ?? 'vertical'}
          onChange={(v) => onChange('layout', v)}
          options={[
            { label: '垂直', value: 'vertical' },
            { label: '水平', value: 'horizontal' },
          ]}
        />
      </FieldGroup>
      <InlineField label="自动换行">
        <w.Checkbox checked={!!values.wrap} onChange={(v) => onChange('wrap', v)} />
      </InlineField>
      <FieldGroup label="背景色">
        <w.Input value={(values.background as string) ?? ''} onChange={(v) => onChange('background', v)} placeholder="如：#f5f5f5" />
      </FieldGroup>
      <FieldGroup label="圆角">
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </FieldGroup>
      <FieldGroup label="最小高度(px)">
        <w.NumberInput value={(values.minHeight as number) ?? 0} onChange={(v) => onChange('minHeight', v)} min={0} max={2000} />
      </FieldGroup>
    </>
  )
}
