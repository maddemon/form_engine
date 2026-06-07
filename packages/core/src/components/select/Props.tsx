import { FieldItem, PropsRenderProps, DataSourceEditorField } from '../../propRenders'

const MODE_OPTIONS = [
  { label: '默认', value: '' },
  { label: '多选', value: 'multiple' },
  { label: '标签', value: 'tags' },
]

export default function SelectPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="选项数据" variant="group">
        <DataSourceEditorField
          dataSource={dataSource}
          onChange={onDataSourceChange}
          optionsType="flat"
          slots={slots}
          widgets={w}
        />
      </FieldItem>
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label="模式">
        <w.ButtonGroup options={MODE_OPTIONS} value={(values.mode as string) ?? ''} onChange={(v) => onChange('mode', v)} />
      </FieldItem>
      {['multiple', 'tags'].includes(values.mode as string) && (
        <FieldItem label="最多标签数">
          <w.NumberInput value={(values.maxTagCount as number) ?? undefined} onChange={(v) => onChange('maxTagCount', v)} min={1} />
        </FieldItem>
      )}
      <FieldItem label="无匹配时文本">
        <w.Input value={(values.notFoundContent as string) ?? ''} onChange={(v) => onChange('notFoundContent', v)} placeholder="无匹配时的提示文字" />
      </FieldItem>
    </>
  )
}
