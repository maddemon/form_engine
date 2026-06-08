import { useLocale } from '../../locale'
import { FieldItem, DataSourceEditorField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TreeSelectPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.treeSelect.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="tree"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.treeSelect.placeholder}>
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder={locale.component.treeSelect.placeholderValue} />
      </FieldItem>
      <FieldItem label={locale.component.treeSelect.allowClear}>
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label={locale.component.treeSelect.searchable}>
        <w.Switch checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </FieldItem>
      <FieldItem label={locale.component.treeSelect.multiple}>
        <w.Switch checked={!!values.multiple} onChange={(v) => onChange('multiple', v)} />
      </FieldItem>
      <FieldItem label={locale.component.treeSelect.treeCheckable}>
        <w.Switch checked={!!values.treeCheckable} onChange={(v) => onChange('treeCheckable', v)} />
      </FieldItem>
    </>
  )
}
