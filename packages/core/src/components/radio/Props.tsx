import { useLocale } from '../../locale'
import { FieldItem, PropsRenderProps, DataSourceEditorField } from '../../propRenders'

export default function RadioPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.radio.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="flat"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.radio.optionType}>
        <w.ButtonGroup
          value={(values.optionType as string) ?? 'default'}
          onChange={(v) => onChange('optionType', v)}
          options={[
            { label: locale.component.radio.defaultType, value: 'default' },
            { label: locale.component.radio.button, value: 'button' },
          ]}
        />
      </FieldItem>
      {values.optionType === 'button' && (
        <FieldItem label={locale.component.radio.buttonStyle}>
          <w.ButtonGroup
            value={(values.buttonStyle as string) ?? 'outline'}
            onChange={(v) => onChange('buttonStyle', v)}
            options={[
              { label: locale.component.radio.border, value: 'outline' },
              { label: locale.component.radio.solid, value: 'solid' },
            ]}
          />
        </FieldItem>
      )}
      <FieldItem label={locale.component.radio.direction}>
        <w.ButtonGroup
          value={(values.direction as string) ?? 'horizontal'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: locale.component.radio.horizontal, value: 'horizontal' },
            { label: locale.component.radio.vertical, value: 'vertical' },
          ]}
        />
      </FieldItem>
    </>
  )
}
