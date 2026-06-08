import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TextPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.text.content}>
        <w.TextArea value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder={locale.component.text.contentPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.text.type}>
        <w.Select
          value={(values.type as string) ?? ''}
          onChange={(v) => onChange('type', v || undefined)}
          options={[
            { label: locale.component.title.default, value: '' },
            { label: locale.component.title.secondary, value: 'secondary' },
            { label: locale.component.title.success, value: 'success' },
            { label: locale.component.title.warning, value: 'warning' },
            { label: locale.component.title.danger, value: 'danger' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.text.fontSize}>
        <w.Input value={(values.fontSize as string) ?? ''} onChange={(v) => onChange('fontSize', v ? Number(v) : undefined)} placeholder={locale.component.text.fontSizePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.text.align}>
        <w.ButtonGroup
          value={(values.textAlign as string) ?? 'left'}
          onChange={(v) => onChange('textAlign', v)}
          options={[
            { label: locale.component.title.left, value: 'left' },
            { label: locale.component.title.center, value: 'center' },
            { label: locale.component.title.right, value: 'right' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.text.keyboard}>
        <w.Switch checked={!!values.keyboard} onChange={(v) => onChange('keyboard', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.bold}>
        <w.Switch checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.italic}>
        <w.Switch checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.underline}>
        <w.Switch checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.strikethrough}>
        <w.Switch checked={!!values.delete} onChange={(v) => onChange('delete', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.code}>
        <w.Switch checked={!!values.code} onChange={(v) => onChange('code', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.mark}>
        <w.Switch checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </FieldItem>
      <FieldItem label={locale.component.text.ellipsis}>
        <w.Switch checked={!!values.ellipsis} onChange={(v) => onChange('ellipsis', v)} />
      </FieldItem>
    </>
  )
}
