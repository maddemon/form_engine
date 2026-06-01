import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

const DATE_PRESET_OPTIONS = [
  { label: '不限', value: '' },
  { label: '今日', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '明天', value: 'tomorrow' },
  { label: '上周', value: 'lastWeek' },
  { label: '下周', value: 'nextWeek' },
  { label: '上月', value: 'lastMonth' },
  { label: '下月', value: 'nextMonth' },
]
const PICKER_OPTIONS = [
  { label: '日期', value: 'date' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '年', value: 'year' },
]

export default function DatePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
      </FieldGroup>
      <FieldGroup label="选择器类型">
        <w.Select
          value={(values.picker as string) ?? 'date'}
          onChange={(v) => onChange('picker', v)}
          options={PICKER_OPTIONS}
        />
      </FieldGroup>
      <InlineField label="显示时间">
        <w.Checkbox checked={!!values.showTime} onChange={(v) => onChange('showTime', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
      <FieldGroup label="最小值/相对日期">
        <w.Select
          value={(values.minDate as string) ?? ''}
          onChange={(v) => onChange('minDate', v)}
          options={DATE_PRESET_OPTIONS}
        />
      </FieldGroup>
      <FieldGroup label="最大值/相对日期">
        <w.Select
          value={(values.maxDate as string) ?? ''}
          onChange={(v) => onChange('maxDate', v)}
          options={DATE_PRESET_OPTIONS}
        />
      </FieldGroup>
      <FieldGroup label="不可选日期表达式">
        <w.Input value={(values.disabledDate as string) ?? ''} onChange={(v) => onChange('disabledDate', v)} placeholder="如：date < new Date()" />
      </FieldGroup>
    </>
  )
}