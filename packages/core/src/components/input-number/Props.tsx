import { FieldGroup, PropsRenderProps } from '../../propRenders'

export default function InputNumberPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.NumberInput value={(values.defaultValue as number) ?? undefined} onChange={(v) => onChange('defaultValue', v)} />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="最小值">
        <w.NumberInput value={(values.min as number) ?? undefined} onChange={(v) => onChange('min', v)} />
      </FieldGroup>
      <FieldGroup label="最大值">
        <w.NumberInput value={(values.max as number) ?? undefined} onChange={(v) => onChange('max', v)} />
      </FieldGroup>
      <FieldGroup label="步长">
        <w.NumberInput value={(values.step as number) ?? 1} onChange={(v) => onChange('step', v)} min={0} />
      </FieldGroup>
      <FieldGroup label="精度">
        <w.NumberInput value={(values.precision as number) ?? undefined} onChange={(v) => onChange('precision', v)} min={0} max={20} />
      </FieldGroup>
      <FieldGroup label="前缀">
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder="如：¥" />
      </FieldGroup>
      <FieldGroup label="后缀">
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} placeholder="如：%" />
      </FieldGroup>
      <FieldGroup label="小数分隔符">
        <w.Input value={(values.decimalSeparator as string) ?? '.'} onChange={(v) => onChange('decimalSeparator', v)} />
      </FieldGroup>
    </>
  )
}