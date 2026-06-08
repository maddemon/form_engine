import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TimePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.timePicker.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.timePicker.format}>
        <w.Input value={(values.format as string) ?? 'HH:mm'} onChange={(v) => onChange('format', v)} placeholder={locale.component.timePicker.formatPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.timePicker.minuteStep}>
        <w.NumberInput value={(values.minuteStep as number) ?? 1} onChange={(v) => onChange('minuteStep', v)} min={1} max={60} />
      </FieldItem>
      <FieldItem label={locale.component.timePicker.secondStep}>
        <w.NumberInput value={(values.secondStep as number) ?? 1} onChange={(v) => onChange('secondStep', v)} min={1} max={60} />
      </FieldItem>
    </>
  )
}
