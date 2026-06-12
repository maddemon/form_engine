import { useLocale } from '../../locale'
import { FieldItem, DataSourceEditorField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

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
      <FieldItem label={locale.component.checkbox.optionType}>
        <w.ButtonGroup
          value={(values.optionType as string) ?? 'default'}
          onChange={(v) => onChange('optionType', v)}
          options={[
            { label: locale.component.checkbox.defaultType, value: 'default' },
            { label: locale.component.checkbox.button, value: 'button' },
          ]}
        />
      </FieldItem>
      {values.optionType === 'button' && (
        <FieldItem label={locale.component.checkbox.buttonStyle}>
          <w.ButtonGroup
            value={(values.buttonStyle as string) ?? 'outline'}
            onChange={(v) => onChange('buttonStyle', v)}
            options={[
              { label: locale.component.checkbox.border, value: 'outline' },
              { label: locale.component.checkbox.solid, value: 'solid' },
            ]}
          />
        </FieldItem>
      )}
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
