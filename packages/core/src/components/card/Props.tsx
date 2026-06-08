import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import iconMap from '../icons'

const iconOptions = Object.keys(iconMap).map(name => ({ label: name, value: name }))

export default function CardPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.card.title}>
        <w.Input value={(values.title as string) ?? ''} onChange={(v) => onChange('title', v)} placeholder={locale.component.card.titlePlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.card.icon}>
        <w.Select
          value={(values.icon as string) ?? ''}
          onChange={(v) => onChange('icon', v)}
          options={[{ label: '无', value: '' }, ...iconOptions]}
        />
      </FieldItem>
      <FieldItem label={locale.component.card.bordered}>
        <w.Switch checked={values.bordered !== false} onChange={(v) => onChange('bordered', v)} />
      </FieldItem>
      <FieldItem label={locale.component.card.size}>
        <w.ButtonGroup
          value={(values.size as string) ?? 'default'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: locale.component.switch.defaultSize, value: 'default' },
            { label: locale.component.switch.smallSize, value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.card.bodyPadding}>
        <w.NumberInput value={(values.bodyPadding as number) ?? 16} onChange={(v) => onChange('bodyPadding', v)} min={0} max={200} />
      </FieldItem>
      <FieldItem label={locale.component.card.bodyGap}>
        <w.NumberInput value={(values.bodyGap as number) ?? 8} onChange={(v) => onChange('bodyGap', v)} min={0} max={100} />
      </FieldItem>
    </>
  )
}
