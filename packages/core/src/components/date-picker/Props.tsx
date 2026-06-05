import { FieldItem, PropsRenderProps } from '../../propRenders'

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
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
      </FieldItem>
      <FieldItem label="选择器类型">
        <w.Select value={(values.picker as string) ?? 'date'} onChange={(v) => onChange('picker', v)} options={PICKER_OPTIONS} />
      </FieldItem>
      <FieldItem label="最小值">
        <w.Select value={(values.minDate as string) ?? ''} onChange={(v) => onChange('minDate', v)} options={DATE_PRESET_OPTIONS} />
      </FieldItem>
      <FieldItem label="最大值">
        <w.Select value={(values.maxDate as string) ?? ''} onChange={(v) => onChange('maxDate', v)} options={DATE_PRESET_OPTIONS} />
      </FieldItem>
      <FieldItem label="是否可选">
        <w.Input value={(values.disabledDate as string) ?? ''} onChange={(v) => onChange('disabledDate', v)} placeholder="如：date < new Date()" />
      </FieldItem>
    </>
  )
}
