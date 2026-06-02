import { PropsRenderProps, RowField } from '../../propRenders'

export default function InputPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </RowField>
      <RowField label="前缀">
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder="如：https://" />
      </RowField>
      <RowField label="后缀">
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} />
      </RowField>
      <RowField label="前置标签">
        <w.Input value={(values.addonBefore as string) ?? ''} onChange={(v) => onChange('addonBefore', v)} />
      </RowField>
      <RowField label="后置标签">
        <w.Input value={(values.addonAfter as string) ?? ''} onChange={(v) => onChange('addonAfter', v)} />
      </RowField>
      <RowField label="自动完成">
        <w.Input value={(values.autoComplete as string) ?? ''} onChange={(v) => onChange('autoComplete', v)} placeholder="如：off" />
      </RowField>
      <RowField label="类型">
        <w.ButtonGroup
          value={(values.type as string) ?? 'text'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '文本', value: 'text' },
            { label: '邮箱', value: 'email' },
            { label: '电话', value: 'tel' },
            { label: 'URL', value: 'url' },
          ]}
        />
      </RowField>
    </>
  )
}
