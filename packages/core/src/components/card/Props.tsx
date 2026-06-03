import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import iconMap from '../icons'

const iconOptions = Object.keys(iconMap).map(name => ({ label: name, value: name }))

export default function CardPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="标题">
        <w.Input value={(values.title as string) ?? ''} onChange={(v) => onChange('title', v)} placeholder="卡片标题" />
      </FieldItem>
      <FieldItem label="图标">
        <w.Select
          value={(values.icon as string) ?? ''}
          onChange={(v) => onChange('icon', v)}
          options={[{ label: '无', value: '' }, ...iconOptions]}
        />
      </FieldItem>
      <FieldItem label="显示边框">
        <w.Switch checked={values.bordered !== false} onChange={(v) => onChange('bordered', v)} />
      </FieldItem>
      <FieldItem label="尺寸">
        <w.ButtonGroup
          value={(values.size as string) ?? 'default'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '默认', value: 'default' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label="Body内边距">
        <w.NumberInput value={(values.bodyPadding as number) ?? 16} onChange={(v) => onChange('bodyPadding', v)} min={0} max={200} />
      </FieldItem>
      <FieldItem label="Body间距">
        <w.NumberInput value={(values.bodyGap as number) ?? 8} onChange={(v) => onChange('bodyGap', v)} min={0} max={100} />
      </FieldItem>
    </>
  )
}
