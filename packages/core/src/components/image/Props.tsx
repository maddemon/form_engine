import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ImagePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.image.src}>
        <w.Input value={(values.src as string) ?? ''} onChange={(v) => onChange('src', v)} placeholder={locale.component.image.srcPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.image.alt}>
        <w.Input value={(values.alt as string) ?? ''} onChange={(v) => onChange('alt', v)} placeholder={locale.component.image.altPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.image.width}>
        <w.Input value={values.width != null ? String(values.width) : ''} onChange={(v) => onChange('width', v ? Number(v) : undefined)} placeholder={locale.component.image.sizePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.image.height}>
        <w.Input value={values.height != null ? String(values.height) : ''} onChange={(v) => onChange('height', v ? Number(v) : undefined)} placeholder={locale.component.image.sizePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.image.preview}>
        <w.Switch checked={values.preview !== false} onChange={(v) => onChange('preview', v)} />
      </FieldItem>
      <FieldItem label={locale.component.image.radius}>
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </FieldItem>
    </>
  )
}
