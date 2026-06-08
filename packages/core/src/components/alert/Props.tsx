import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import iconMap from '../icons'

const iconOptions = Object.keys(iconMap).map(name => ({ label: name, value: name }))

export default function AlertPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.alert.type}>
        <w.Select
          value={(values.type as string) ?? 'info'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: locale.component.alert.primary, value: 'primary' },
            { label: locale.component.alert.info, value: 'info' },
            { label: locale.component.alert.success, value: 'success' },
            { label: locale.component.alert.warning, value: 'warning' },
            { label: locale.component.alert.error, value: 'error' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.alert.title}>
        <w.Input value={(values.title as string) ?? ''} onChange={(v) => onChange('title', v)} placeholder={locale.component.alert.titlePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.alert.content}>
        <w.Input value={(values.content as string) ?? ''} onChange={(v) => onChange('content', v)} placeholder={locale.component.alert.contentPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.alert.showIcon}>
        <w.Switch checked={values.showIcon !== false} onChange={(v) => onChange('showIcon', v)} />
      </FieldItem>
      <FieldItem label={locale.component.alert.closable}>
        <w.Switch checked={!!values.closable} onChange={(v) => onChange('closable', v)} />
      </FieldItem>
      <FieldItem label={locale.component.alert.customIcon}>
        <w.Select
          value={(values.icon as string) ?? ''}
          onChange={(v) => onChange('icon', v)}
          options={[{ label: locale.component.alert.none, value: '' }, ...iconOptions]}
        />
      </FieldItem>
    </>
  )
}
