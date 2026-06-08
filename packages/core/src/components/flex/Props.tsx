import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

const WRAP_OPTIONS = [
  { label: '不换行', value: 'nowrap' },
  { label: '换行', value: 'wrap' },
  { label: '反向换行', value: 'wrap-reverse' },
]
const JUSTIFY_OPTIONS = [
  { label: '起始', value: 'flex-start' },
  { label: '居中', value: 'center' },
  { label: '末端', value: 'flex-end' },
  { label: '均匀分布', value: 'space-between' },
  { label: '环绕', value: 'space-around' },
  { label: '等距', value: 'space-evenly' },
]
const ALIGN_OPTIONS = [
  { label: '拉伸', value: 'stretch' },
  { label: '起始', value: 'flex-start' },
  { label: '居中', value: 'center' },
  { label: '末端', value: 'flex-end' },
  { label: '基线', value: 'baseline' },
]

export default function FlexPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.flex.direction}>
        <w.Select
          value={(values.direction as string) ?? 'row'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: '水平', value: 'row' },
            { label: '水平反序', value: 'row-reverse' },
            { label: '垂直', value: 'column' },
            { label: '垂直反序', value: 'column-reverse' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.flex.justify}>
        <w.Select value={(values.justify as string) ?? 'flex-start'} onChange={(v) => onChange('justify', v)} options={JUSTIFY_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.flex.align}>
        <w.Select value={(values.align as string) ?? 'stretch'} onChange={(v) => onChange('align', v)} options={ALIGN_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.flex.gap}>
        <w.NumberInput value={(values.gap as number) ?? 0} onChange={(v) => onChange('gap', v)} min={0} max={100} />
      </FieldItem>
      <FieldItem label={locale.component.flex.wrap}>
        <w.Select value={(values.wrap as string) ?? 'nowrap'} onChange={(v) => onChange('wrap', v)} options={WRAP_OPTIONS} />
      </FieldItem>
      <FieldItem label={locale.component.flex.padding}>
        <w.NumberInput value={(values.padding as number) ?? 0} onChange={(v) => onChange('padding', v)} min={0} max={200} />
      </FieldItem>
      <FieldItem label={locale.component.flex.margin}>
        <w.NumberInput value={(values.margin as number) ?? 0} onChange={(v) => onChange('margin', v)} min={0} max={200} />
      </FieldItem>
    </>
  )
}
