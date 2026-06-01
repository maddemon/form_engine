import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DateTimePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder="如: 2026-06-01 12:00" />
      </FieldGroup>
      <FieldGroup label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD HH:mm'} onChange={(v) => onChange('format', v)} placeholder="如：YYYY-MM-DD HH:mm" />
      </FieldGroup>
      <FieldGroup label="选择器类型">
        <w.ButtonGroup
          value={(values.picker as string) ?? 'date'}
          onChange={(v) => onChange('picker', v)}
          options={[
            { label: '日期', value: 'date' },
            { label: '周', value: 'week' },
            { label: '月', value: 'month' },
            { label: '年', value: 'year' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
    </>
  )
}