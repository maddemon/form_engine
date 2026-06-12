import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function SliderPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.slider.defaultValue}>
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder={locale.component.slider.defaultPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.slider.min}>
        <w.NumberInput value={(values.min as number) ?? 0} onChange={(v) => onChange('min', v)} />
      </FieldItem>
      <FieldItem label={locale.component.slider.max}>
        <w.NumberInput value={(values.max as number) ?? 100} onChange={(v) => onChange('max', v)} />
      </FieldItem>
      <FieldItem label={locale.component.slider.step}>
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </FieldItem>
      <FieldItem label={locale.component.slider.formatter}>
        <w.Input value={((values.tooltip as { formatter?: string })?.formatter as string) ?? ''} onChange={(v) => onChange('tooltip', v ? { formatter: v } : undefined)} placeholder={locale.component.slider.formatterPlaceholder} />
      </FieldItem>
    </>
  )
}
