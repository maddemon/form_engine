import { useLocale } from '../../locale'
import { FieldItem, DataSourceEditorField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function CascaderPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.cascader.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="tree"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.cascader.placeholder}>
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder={locale.component.cascader.placeholderValue} />
      </FieldItem>
      <FieldItem label={locale.component.cascader.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.cascader.searchable}>
        <w.Switch checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </FieldItem>
      <FieldItem label={locale.component.cascader.expandTrigger}>
        <w.ButtonGroup
          value={(values.expandTrigger as string) ?? 'click'}
          onChange={(v) => onChange('expandTrigger', v)}
          options={[
            { label: locale.component.cascader.click, value: 'click' },
            { label: locale.component.cascader.hover, value: 'hover' },
          ]}
        />
      </FieldItem>
    </>
  )
}
