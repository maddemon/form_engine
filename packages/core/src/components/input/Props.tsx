import { FieldGroup, PropsRenderProps } from '../../propRenders'

export default function InputPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} />
      </FieldGroup>
      <FieldGroup label="输入类型">
        <w.Select
          value={(values.type as string) ?? 'text'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '文本', value: 'text' },
            { label: '密码', value: 'password' },
            { label: '邮箱', value: 'email' },
            { label: '电话', value: 'tel' },
            { label: 'URL', value: 'url' },
          ]}
        />
      </FieldGroup>
    </>
  )
}
