import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function CheckboxPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="选项" variant="group">
        <w.OptionsEditor value={values.options as { label: string; value: string }[]} onChange={(v) => onChange('options', v)} />
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
