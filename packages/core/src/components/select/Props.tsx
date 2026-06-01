import { FieldGroup, InlineField, OptionRender, PropsRenderProps } from '../../propRenders'

export default function SelectPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldGroup>
      <FieldGroup label="模式">
        <w.Select
          value={(values.mode as string) ?? ''}
          onChange={(v) => onChange('mode', v || undefined)}
          options={[
            { label: '默认', value: '' },
            { label: '多选', value: 'multiple' },
            { label: '标签', value: 'tags' },
          ]}
        />
      </FieldGroup>
      <InlineField label="可搜索">
        <w.Checkbox checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
      <FieldGroup label="最多标签数">
        <w.NumberInput value={(values.maxTagCount as number) ?? undefined} onChange={(v) => onChange('maxTagCount', v)} min={1} />
      </FieldGroup>
    </>
  )
}
