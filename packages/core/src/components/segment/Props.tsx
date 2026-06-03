import { FieldItem, OptionRender, PropsRenderProps } from '../../propRenders'

export default function SegmentPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldItem>
      <FieldItem label="默认值">
        <w.Input
          value={(values.defaultValue as string) ?? ''}
          onChange={(v) => onChange('defaultValue', v)}
          placeholder="选项的 value 值"
        />
      </FieldItem>
      <FieldItem label="尺寸">
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label="块级">
        <w.Switch checked={!!values.block} onChange={(v) => onChange('block', v)} />
      </FieldItem>
      <FieldItem label="禁用">
        <w.Switch checked={!!values.disabled} onChange={(v) => onChange('disabled', v)} />
      </FieldItem>
    </>
  )
}
