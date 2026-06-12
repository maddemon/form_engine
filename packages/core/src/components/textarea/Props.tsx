import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TextAreaPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const autoSizeValue = values.autoSize
  const isAutoSize = autoSizeValue === true || (typeof autoSizeValue === 'object' && autoSizeValue !== null)

  return (
    <>
      <FieldItem label={locale.component.textarea.placeholder}>
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldItem>
      <FieldItem label={locale.component.textarea.rows}>
        <w.NumberInput value={(values.rows as number) ?? 4} onChange={(v) => onChange('rows', v)} min={1} max={20} />
      </FieldItem>
      <FieldItem label={locale.component.textarea.autoSize}>
        <w.Switch checked={isAutoSize} onChange={(v) => onChange('autoSize', v ? true : undefined)} />
      </FieldItem>
      {isAutoSize && (
        <>
          <FieldItem label={locale.component.textarea.minRows}>
            <w.NumberInput value={(autoSizeValue as Record<string, number>)?.minRows ?? 1} onChange={(v) => onChange('autoSize', { ...(typeof autoSizeValue === 'object' ? autoSizeValue : {}), minRows: v })} min={1} />
          </FieldItem>
          <FieldItem label={locale.component.textarea.maxRows}>
            <w.NumberInput value={(autoSizeValue as Record<string, number>)?.maxRows ?? 6} onChange={(v) => onChange('autoSize', { ...(typeof autoSizeValue === 'object' ? autoSizeValue : {}), maxRows: v })} min={1} />
          </FieldItem>
        </>
      )}
      <FieldItem label={locale.component.textarea.maxLength}>
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldItem>
    </>
  )
}
