import { FieldGroup, OptionRender, PropsRenderProps, RowField } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldGroup>
      <RowField label="半选状态">
        <w.Switch checked={!!values.indeterminate} onChange={(v) => onChange('indeterminate', v)} />
      </RowField>
      <FieldGroup label="排列方向">
        <w.ButtonGroup
          value={(values.direction as string) ?? 'horizontal'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: '横向', value: 'horizontal' },
            { label: '竖向', value: 'vertical' },
          ]}
        />
      </FieldGroup>
    </>
  )
}