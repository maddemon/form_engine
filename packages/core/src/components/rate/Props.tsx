import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function RatePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.rate.defaultValue}>
        <w.NumberInput value={(values.defaultValue as number) ?? undefined} onChange={(v) => onChange('defaultValue', v)} />
      </FieldItem>
      <FieldItem label={locale.component.rate.count}>
        <w.NumberInput value={(values.count as number) ?? 5} onChange={(v) => onChange('count', v)} min={1} max={10} />
      </FieldItem>
      <FieldItem label={locale.component.rate.character}>
        <w.Input value={(values.character as string) ?? ''} onChange={(v) => onChange('character', v)} placeholder={locale.component.rate.characterPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.rate.tooltips}>
        <w.Input value={((values.tooltips as string[]) ?? []).join(',')} onChange={(v) => onChange('tooltips', v ? (v as string).split(',').map((s) => s.trim()) : undefined)} placeholder={locale.component.rate.tooltipsPlaceholder} />
      </FieldItem>
    </>
  )
}
