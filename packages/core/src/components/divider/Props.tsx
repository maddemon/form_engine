import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function DividerPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.divider.direction}>
        <w.ButtonGroup
          value={(values.type as string) ?? 'horizontal'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: locale.component.divider.horizontal, value: 'horizontal' },
            { label: locale.component.divider.vertical, value: 'vertical' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.divider.textPosition}>
        <w.ButtonGroup
          value={(values.textPlacement as string) ?? 'center'}
          onChange={(v) => onChange('textPlacement', v)}
          options={[
            { label: locale.component.divider.center, value: 'center' },
            { label: locale.component.divider.left, value: 'left' },
            { label: locale.component.divider.right, value: 'right' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.divider.plain}>
        <w.Switch checked={!!values.plain} onChange={(v) => onChange('plain', v)} />
      </FieldItem>
      <FieldItem label={locale.component.divider.textContent}>
        <w.Input
          value={(values.children as string) ?? ''}
          onChange={(v) => onChange('children', v)}
          placeholder={locale.component.divider.textContentPlaceholder}
        />
      </FieldItem>
      <FieldItem label={locale.component.divider.color}>
        <w.Input value={(values.color as string) ?? ''} onChange={(v) => onChange('color', v)} placeholder={locale.component.divider.colorPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.divider.weight}>
        <w.NumberInput
          value={(values.thickness as number) ?? 1}
          onChange={(v) => onChange('thickness', v)}
          min={0}
          max={10}
        />
      </FieldItem>
    </>
  )
}
