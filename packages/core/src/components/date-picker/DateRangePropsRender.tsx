import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DateRangePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder="如: 开始日期,结束日期" />
      </FieldItem>
      <FieldItem label="格式">
        <w.Input value={(values.format as string) ?? 'YYYY-MM-DD'} onChange={(v) => onChange('format', v)} />
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
      <FieldItem label="显示时间">
        <w.Switch checked={!!values.showTime} onChange={(v) => onChange('showTime', v)} />
      </FieldItem>
      <FieldItem label="开始占位文本">
        <w.Input value={(values.placeholder as string[])?.[0] ?? ''} onChange={(v) => onChange('placeholder', [(v as string) || '开始日期', (values.placeholder as string[])?.[1] ?? '结束日期'])} placeholder="开始日期" />
      </FieldItem>
      <FieldItem label="结束占位文本">
        <w.Input value={(values.placeholder as string[])?.[1] ?? ''} onChange={(v) => onChange('placeholder', [(values.placeholder as string[])?.[0] ?? '开始日期', (v as string) || '结束日期'])} placeholder="结束日期" />
      </FieldItem>
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
    </>
  )
}
