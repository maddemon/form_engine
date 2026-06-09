import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function FlexPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()

  const WRAP_OPTIONS = [
    { label: locale.component.flex.wrapNoWrap, value: 'nowrap' },
    { label: locale.component.flex.wrapWrap, value: 'wrap' },
    { label: locale.component.flex.wrapReverse, value: 'wrap-reverse' },
  ]
  const JUSTIFY_OPTIONS = [
    { label: locale.component.flex.justifyFlexStart, value: 'flex-start' },
    { label: locale.component.flex.justifyCenter, value: 'center' },
    { label: locale.component.flex.justifyFlexEnd, value: 'flex-end' },
    { label: locale.component.flex.justifySpaceBetween, value: 'space-between' },
    { label: locale.component.flex.justifySpaceAround, value: 'space-around' },
    { label: locale.component.flex.justifySpaceEvenly, value: 'space-evenly' },
  ]
  const ALIGN_OPTIONS = [
    { label: locale.component.flex.alignStretch, value: 'stretch' },
    { label: locale.component.flex.alignFlexStart, value: 'flex-start' },
    { label: locale.component.flex.alignCenter, value: 'center' },
    { label: locale.component.flex.alignFlexEnd, value: 'flex-end' },
    { label: locale.component.flex.alignBaseline, value: 'baseline' },
  ]

  return (
    <>
      <FieldItem label={locale.component.flex.direction}>
        <w.Select
          value={(values.direction as string) ?? 'row'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: locale.component.flex.directionRow, value: 'row' },
            { label: locale.component.flex.directionRowReverse, value: 'row-reverse' },
            { label: locale.component.flex.directionColumn, value: 'column' },
            { label: locale.component.flex.directionColumnReverse, value: 'column-reverse' },
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
