import { FieldGroup, OptionRender, PropsRenderProps } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <FieldGroup label="选项">
      <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
    </FieldGroup>
  )
}
