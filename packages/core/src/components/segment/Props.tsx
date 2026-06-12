import { useLocale } from '../../locale'
import { FieldItem, DataSourceEditorField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function SegmentPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const { locale } = useLocale()
  return (
    <>
      <FieldItem label={locale.component.segment.dataSource} variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="flat"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label={locale.component.segment.defaultValue}>
        <w.Input
          value={(values.defaultValue as string) ?? ''}
          onChange={(v) => onChange('defaultValue', v)}
          placeholder={locale.component.segment.placeholder}
        />
      </FieldItem>
      <FieldItem label={locale.component.segment.size}>
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: locale.component.segment.large, value: 'large' },
            { label: locale.component.segment.medium, value: 'middle' },
            { label: locale.component.segment.small, value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.segment.block}>
        <w.Switch checked={!!values.block} onChange={(v) => onChange('block', v)} />
      </FieldItem>
      <FieldItem label={locale.component.segment.disabled}>
        <w.Switch checked={!!values.disabled} onChange={(v) => onChange('disabled', v)} />
      </FieldItem>
    </>
  )
}
