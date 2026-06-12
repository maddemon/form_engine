import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function InputPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.input.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.input.maxLength}>
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldItem>
      <FieldItem label={locale.component.input.prefix}>
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder={locale.component.input.prefixPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.input.suffix}>
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} />
      </FieldItem>
      <FieldItem label={locale.component.input.addonBefore}>
        <w.Input value={(values.addonBefore as string) ?? ''} onChange={(v) => onChange('addonBefore', v)} />
      </FieldItem>
      <FieldItem label={locale.component.input.addonAfter}>
        <w.Input value={(values.addonAfter as string) ?? ''} onChange={(v) => onChange('addonAfter', v)} />
      </FieldItem>
      <FieldItem label={locale.component.input.autoComplete}>
        <w.Input value={(values.autoComplete as string) ?? ''} onChange={(v) => onChange('autoComplete', v)} placeholder={locale.component.input.autoCompletePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.input.type}>
        <w.ButtonGroup
          value={(values.type as string) ?? 'text'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: locale.component.input.text, value: 'text' },
            { label: locale.component.input.email, value: 'email' },
            { label: locale.component.input.phone, value: 'tel' },
            { label: locale.component.input.url, value: 'url' },
          ]}
        />
      </FieldItem>
    </>
  )
}
