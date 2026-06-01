import { FieldGroup, InlineField, OptionRender, PropsRenderProps } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldGroup>
      <InlineField label="半选状态">
        <w.Checkbox checked={!!values.indeterminate} onChange={(v) => onChange('indeterminate', v)} />
      </InlineField>
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