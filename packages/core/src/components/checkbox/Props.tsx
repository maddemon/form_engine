import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="选项数据" variant="group">
        <w.DataSourceEditor
          value={dataSource}
          onChange={(v) => onDataSourceChange?.(v)}
          optionsType="flat"
        />
      </FieldItem>
      <FieldItem label="半选状态">
        <w.Switch checked={!!values.indeterminate} onChange={(v) => onChange('indeterminate', v)} />
      </FieldItem>
      <FieldItem label="排列方向">
        <w.ButtonGroup
          value={(values.direction as string) ?? 'horizontal'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: '横向', value: 'horizontal' },
            { label: '竖向', value: 'vertical' },
          ]}
        />
      </FieldItem>
    </>
  )
}
