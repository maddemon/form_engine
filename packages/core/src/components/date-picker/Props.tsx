import { useLocale } from '../../locale'
import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function DatePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const DATE_PRESET_OPTIONS = [
    { label: locale.component.datePicker.unlimited, value: '' },
    { label: locale.component.datePicker.today, value: 'today' },
    { label: locale.component.datePicker.yesterday, value: 'yesterday' },
    { label: locale.component.datePicker.tomorrow, value: 'tomorrow' },
    { label: locale.component.datePicker.lastWeek, value: 'lastWeek' },
    { label: locale.component.datePicker.nextWeek, value: 'nextWeek' },
    { label: locale.component.datePicker.lastMonth, value: 'lastMonth' },
    { label: locale.component.datePicker.nextMonth, value: 'nextMonth' },
  ]
  const PICKER_OPTIONS = [
    { label: locale.component.datePicker.date, value: 'date' },
    { label: locale.component.datePicker.week, value: 'week' },
    { label: locale.component.datePicker.month, value: 'month' },
    { label: locale.component.datePicker.quarter, value: 'quarter' },
    { label: locale.component.datePicker.year, value: 'year' },
  ]
  return (
    <>
      <FieldItem label={locale.component.datePicker.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.datePicker.format}>
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
      </FieldItem>
      <FieldItem label={locale.component.datePicker.picker}>
        <w.Select value={(values.picker as string) ?? 'date'} onChange={(v) => onChange('picker', v)} options={PICKER_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.datePicker.minDate}>
        <w.Select value={(values.minDate as string) ?? ''} onChange={(v) => onChange('minDate', v)} options={DATE_PRESET_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.datePicker.maxDate}>
        <w.Select value={(values.maxDate as string) ?? ''} onChange={(v) => onChange('maxDate', v)} options={DATE_PRESET_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.datePicker.disabledDate}>
        <w.Input value={(values.disabledDate as string) ?? ''} onChange={(v) => onChange('disabledDate', v)} placeholder={locale.component.datePicker.disabledDatePlaceholder} />
      </FieldItem>
    </>
  )
}
