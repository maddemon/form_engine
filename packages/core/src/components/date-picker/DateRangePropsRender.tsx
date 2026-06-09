import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DateRangePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()

  return (
    <>
      <FieldItem label={locale.component.dateRange.defaultValue}>
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder={locale.component.dateRange.startPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.format}>
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.picker}>
        <w.ButtonGroup
          value={(values.picker as string) ?? 'date'}
          onChange={(v) => onChange('picker', v)}
          options={[
            { label: locale.component.dateRange.date, value: 'date' },
            { label: locale.component.dateRange.week, value: 'week' },
            { label: locale.component.dateRange.month, value: 'month' },
            { label: locale.component.dateRange.year, value: 'year' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.showTime}>
        <w.Switch checked={!!values.showTime} onChange={(v) => onChange('showTime', v)} />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.startPlaceholder}>
        <w.Input
          value={(values.placeholder as string[])?.[0] ?? ''}
          onChange={(v) =>
            onChange('placeholder', [
              (v as string) || locale.component.dateRange.startPlaceholder,
              (values.placeholder as string[])?.[1] ?? locale.component.dateRange.endPlaceholder,
            ])
          }
          placeholder={locale.component.dateRange.startPlaceholder}
        />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.endPlaceholder}>
        <w.Input
          value={(values.placeholder as string[])?.[1] ?? ''}
          onChange={(v) =>
            onChange('placeholder', [
              (values.placeholder as string[])?.[0] ?? locale.component.dateRange.startPlaceholder,
              (v as string) || locale.component.dateRange.endPlaceholder,
            ])
          }
          placeholder={locale.component.dateRange.endPlaceholder}
        />
      </FieldItem>
      <FieldItem label={locale.component.dateRange.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
    </>
  )
}
