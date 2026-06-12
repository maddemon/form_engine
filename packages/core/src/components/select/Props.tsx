import { useLocale } from '../../locale'
import { FieldItem, DataSourceEditorField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function SelectPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  const MODE_OPTIONS = [
    { label: locale.component.select.modeDefault, value: '' },
    { label: locale.component.select.modeMultiple, value: 'multiple' },
    { label: locale.component.select.modeTags, value: 'tags' },
  ]
  return (
    <>
      <FieldItem label={locale.component.select.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="flat"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.select.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.select.mode}>
        <w.ButtonGroup options={MODE_OPTIONS} value={(values.mode as string) ?? ''} onChange={(v) => onChange('mode', v)} />
      </FieldItem>
      {['multiple', 'tags'].includes(values.mode as string) && (
        <FieldItem label={locale.component.select.maxTagCount}>
          <w.NumberInput value={(values.maxTagCount as number) ?? undefined} onChange={(v) => onChange('maxTagCount', v)} min={1} />
        </FieldItem>
      )}
      <FieldItem label={locale.component.select.notFoundContent}>
        <w.Input value={(values.notFoundContent as string) ?? ''} onChange={(v) => onChange('notFoundContent', v)} placeholder={locale.component.select.notFoundContentPlaceholder} />
      </FieldItem>
    </>
  )
}
