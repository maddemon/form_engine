import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DateTimePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD HH:mm'} onChange={(v) => onChange('format', v)} placeholder="如：YYYY-MM-DD HH:mm" />
      </FieldItem>
      <FieldItem label="选择器类型">
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
      </FieldItem>
    </>
  )
}
