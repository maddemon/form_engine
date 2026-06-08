import { useLocale } from '../../locale'
import { FieldItem, PropsRenderProps, DataSourceEditorField } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.checkbox.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="flat"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.checkbox.indeterminate}>
        <w.Switch checked={!!values.indeterminate} onChange={(v) => onChange('indeterminate', v)} />
      </FieldItem>
      <FieldItem label={locale.component.checkbox.direction}>
        <w.ButtonGroup
          value={(values.direction as string) ?? 'horizontal'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: locale.component.checkbox.horizontal, value: 'horizontal' },
            { label: locale.component.checkbox.vertical, value: 'vertical' },
          ]}
        />
      </FieldItem>
    </>
  )
}
