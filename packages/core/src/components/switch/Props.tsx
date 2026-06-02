import { FieldGroup, PropsRenderProps, RowField } from '../../propRenders'

export default function SwitchPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="默认选中">
        <w.Switch checked={!!values.defaultValue} onChange={(v) => onChange('defaultValue', v)} />
      </RowField>
      <FieldGroup label="尺寸">
        <w.ButtonGroup
          value={(values.size as string) ?? 'default'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '默认', value: 'default' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldGroup>
      <RowField label="选中时文字">
        <w.Input value={(values.checkedChildren as string) ?? ''} onChange={(v) => onChange('checkedChildren', v)} placeholder="如：开" />
      </RowField>
      <RowField label="未选中时文字">
        <w.Input value={(values.unCheckedChildren as string) ?? ''} onChange={(v) => onChange('unCheckedChildren', v)} placeholder="如：关" />
      </RowField>
    </>
  )
}
