import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DateTimePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.dateTime.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.dateTime.format}>
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD HH:mm'} onChange={(v) => onChange('format', v)} placeholder={locale.component.dateTime.formatPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.dateTime.picker}>
        <w.ButtonGroup
          value={(values.picker as string) ?? 'date'}
          onChange={(v) => onChange('picker', v)}
          options={[
            { label: locale.component.datePicker.date, value: 'date' },
            { label: locale.component.datePicker.week, value: 'week' },
            { label: locale.component.datePicker.month, value: 'month' },
            { label: locale.component.datePicker.year, value: 'year' },
          ]}
        />
      </FieldItem>
    </>
  )
}
