import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function InputNumberPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.inputNumber.min}>
        <w.NumberInput value={(values.min as number) ?? undefined} onChange={(v) => onChange('min', v)} />
      </FieldItem>
      <FieldItem label={locale.component.inputNumber.max}>
        <w.NumberInput value={(values.max as number) ?? undefined} onChange={(v) => onChange('max', v)} />
      </FieldItem>
      <FieldItem label={locale.component.inputNumber.step}>
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </FieldItem>
      <FieldItem label={locale.component.inputNumber.precision}>
        <w.NumberInput value={(values.precision as number) ?? undefined} onChange={(v) => onChange('precision', v)} min={0} max={20} />
      </FieldItem>
      <FieldItem label={locale.component.inputNumber.prefix}>
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder={locale.component.inputNumber.prefixPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.inputNumber.suffix}>
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} placeholder={locale.component.inputNumber.suffixPlaceholder} />
      </FieldItem>
    </>
  )
}
