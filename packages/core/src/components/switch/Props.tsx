import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function SwitchPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.switch.defaultChecked}>
        <w.Switch checked={!!values.defaultValue} onChange={(v) => onChange('defaultValue', v)} />
      </FieldItem>
      <FieldItem label={locale.component.switch.size}>
        <w.ButtonGroup
          value={(values.size as string) ?? 'default'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: locale.component.switch.defaultSize, value: 'default' },
            { label: locale.component.switch.smallSize, value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.switch.checkedText}>
        <w.Input value={(values.checkedChildren as string) ?? ''} onChange={(v) => onChange('checkedChildren', v)} placeholder={locale.component.switch.checkedPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.switch.uncheckedText}>
        <w.Input value={(values.unCheckedChildren as string) ?? ''} onChange={(v) => onChange('unCheckedChildren', v)} placeholder={locale.component.switch.uncheckedPlaceholder} />
      </FieldItem>
    </>
  )
}
