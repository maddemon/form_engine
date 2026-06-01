import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function SwitchPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <InlineField label="默认选中">
        <w.Checkbox checked={!!values.defaultChecked} onChange={(v) => onChange('defaultChecked', v)} />
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
    </>
  )
}
