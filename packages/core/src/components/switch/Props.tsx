import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function SwitchPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <InlineField label="默认选中">
        <w.Checkbox checked={!!values.defaultValue} onChange={(v) => onChange('defaultValue', v)} />
      </InlineField>
      <FieldGroup label="尺寸">
        <w.Select
          value={(values.size as string) ?? 'default'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '默认', value: 'default' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="选中时文字">
        <w.Input value={(values.checkedChildren as string) ?? ''} onChange={(v) => onChange('checkedChildren', v)} placeholder="如：开" />
      </FieldGroup>
      <FieldGroup label="未选中时文字">
        <w.Input value={(values.unCheckedChildren as string) ?? ''} onChange={(v) => onChange('unCheckedChildren', v)} placeholder="如：关" />
      </FieldGroup>
    </>
  )
}
