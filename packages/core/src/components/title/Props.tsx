import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TitlePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.title.content}>
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder={locale.component.title.contentPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.title.level}>
        <w.ButtonGroup
          value={String((values.level as number) ?? 1)}
          onChange={(v) => onChange('level', Number(v))}
          options={[
            { label: 'H1', value: '1' },
            { label: 'H2', value: '2' },
            { label: 'H3', value: '3' },
            { label: 'H4', value: '4' },
            { label: 'H5', value: '5' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.title.type}>
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
      <FieldItem label={locale.component.title.align}>
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
      <FieldItem label={locale.component.title.bold}>
        <w.Switch checked={!!values.strong} onChange={(v) => onChange('strong', v)} />
      </FieldItem>
      <FieldItem label={locale.component.title.italic}>
        <w.Switch checked={!!values.italic} onChange={(v) => onChange('italic', v)} />
      </FieldItem>
      <FieldItem label={locale.component.title.underline}>
        <w.Switch checked={!!values.underline} onChange={(v) => onChange('underline', v)} />
      </FieldItem>
      <FieldItem label={locale.component.title.mark}>
        <w.Switch checked={!!values.mark} onChange={(v) => onChange('mark', v)} />
      </FieldItem>
    </>
  )
}
