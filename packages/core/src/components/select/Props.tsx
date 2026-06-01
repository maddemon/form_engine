import { FieldGroup, InlineField, OptionRender, PropsRenderProps } from '../../propRenders'

const MODE_OPTIONS = [
  { label: '默认', value: '' },
  { label: '多选', value: 'multiple' },
  { label: '标签', value: 'tags' },
]

export default function SelectPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} placeholder="多选时用逗号分隔" />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} />
      </FieldGroup>
      <FieldGroup label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldGroup>
      <FieldGroup label="模式">
        <w.Select
          value={(values.mode as string) ?? ''}
          onChange={(v) => onChange('mode', v)}
          options={MODE_OPTIONS}
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
      <FieldGroup label="无匹配时文本">
        <w.Input value={(values.notFoundContent as string) ?? ''} onChange={(v) => onChange('notFoundContent', v)} placeholder="无匹配时的提示文字" />
      </FieldGroup>
    </>
  )
}