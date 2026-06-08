import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ButtonPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.button.size}>
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: locale.component.button.small, value: 'small' },
            { label: locale.component.button.medium, value: 'middle' },
            { label: locale.component.button.large, value: 'large' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.button.btnType}>
        <w.Select
          value={(values.type as string) ?? 'default'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: locale.component.button.default, value: 'default' },
            { label: locale.component.button.primary, value: 'primary' },
            { label: locale.component.button.dashed, value: 'dashed' },
            { label: locale.component.button.link, value: 'link' },
            { label: locale.component.button.textType, value: 'text' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.button.icon}>
        <w.Input value={(values.icon as string) ?? ''} onChange={(v) => onChange('icon', v)} placeholder={locale.component.button.iconPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.button.text}>
        <w.Input value={(values.children as string) ?? ''} onChange={(v) => onChange('children', v)} placeholder={locale.component.button.textPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.button.block}>
        <w.Switch checked={!!values.block} onChange={(v) => onChange('block', v)} />
      </FieldItem>
      <FieldItem label={locale.component.button.danger}>
        <w.Switch checked={!!values.danger} onChange={(v) => onChange('danger', v)} />
      </FieldItem>
      <FieldItem label={locale.component.button.loading}>
        <w.Switch checked={!!values.loading} onChange={(v) => onChange('loading', v)} />
      </FieldItem>
    </>
  )
}
