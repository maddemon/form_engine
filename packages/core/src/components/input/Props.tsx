import { FieldGroup, InlineField, PropsRenderProps } from '../../propRenders'

export default function InputPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldGroup>
      <InlineField label="显示字数">
        <w.Checkbox checked={!!values.showCount} onChange={(v) => onChange('showCount', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
      <FieldGroup label="前缀">
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} placeholder="如：https://" />
      </FieldGroup>
      <FieldGroup label="后缀">
        <w.Input value={(values.suffix as string) ?? ''} onChange={(v) => onChange('suffix', v)} />
      </FieldGroup>
      <FieldGroup label="前置标签">
        <w.Input value={(values.addonBefore as string) ?? ''} onChange={(v) => onChange('addonBefore', v)} />
      </FieldGroup>
      <FieldGroup label="后置标签">
        <w.Input value={(values.addonAfter as string) ?? ''} onChange={(v) => onChange('addonAfter', v)} />
      </FieldGroup>
      <FieldGroup label="自动完成">
        <w.Input value={(values.autoComplete as string) ?? ''} onChange={(v) => onChange('autoComplete', v)} placeholder="如：off" />
      </FieldGroup>
      <FieldGroup label="输入类型">
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
      </FieldGroup>
    </>
  )
}