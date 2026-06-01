import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TimePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder="如: 12:00" />
      </FieldGroup>
      <FieldGroup label="格式">
        <w.Input value={(values.format as string) ?? 'HH:mm'} onChange={(v) => onChange('format', v)} placeholder="如：HH:mm" />
      </FieldGroup>
      <FieldGroup label="分钟步长">
        <w.NumberInput value={(values.minuteStep as number) ?? 1} onChange={(v) => onChange('minuteStep', v)} min={1} max={60} />
      </FieldGroup>
      <FieldGroup label="秒步长">
        <w.NumberInput value={(values.secondStep as number) ?? 1} onChange={(v) => onChange('secondStep', v)} min={1} max={60} />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请选择时间" />
      </FieldGroup>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
    </>
  )
}