import { RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TimePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="格式">
        <w.Input value={(values.format as string) ?? 'HH:mm'} onChange={(v) => onChange('format', v)} placeholder="如：HH:mm" />
      </RowField>
      <RowField label="分钟步长">
        <w.NumberInput value={(values.minuteStep as number) ?? 1} onChange={(v) => onChange('minuteStep', v)} min={1} max={60} />
      </RowField>
      <RowField label="秒步长">
        <w.NumberInput value={(values.secondStep as number) ?? 1} onChange={(v) => onChange('secondStep', v)} min={1} max={60} />
      </RowField>
    </>
  )
}