import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function DatePickerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
      </FieldGroup>
      <FieldGroup label="选择器类型">
        <w.Select
          value={(values.picker as string) ?? 'date'}
          onChange={(v) => onChange('picker', v)}
          options={[
            { label: '日期', value: 'date' },
            { label: '周', value: 'week' },
            { label: '月', value: 'month' },
            { label: '季度', value: 'quarter' },
            { label: '年', value: 'year' },
          ]}
        />
      </FieldGroup>
      <InlineField label="显示时间">
        <w.Checkbox checked={!!values.showTime} onChange={(v) => onChange('showTime', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
    </>
  )
}
