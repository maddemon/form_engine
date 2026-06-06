import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import { resolveSlot } from '../../registry/propertySlotRegistry'

export default function CascaderPropsRender({ widgets: w, values, onChange, dataSource, onDataSourceChange, slots }: PropsRenderProps) {
  const DataSourceEditorSlot = resolveSlot('dataSourceEditor', slots, w)
  return (
    <>
      <FieldItem label="选项数据" variant="group">
        <DataSourceEditorSlot
          value={dataSource}
          onChange={(v) => onDataSourceChange?.(v as import('../../types/schema').FieldDataSource)}
          context={{ optionsType: 'tree' }}
        />
      </FieldItem>
      <FieldItem label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请选择" />
      </FieldItem>
      <FieldItem label="允许清除">
        <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </FieldItem>
      <FieldItem label="可搜索">
        <w.Switch checked={!!values.showSearch} onChange={(v) => onChange('showSearch', v)} />
      </FieldItem>
      <FieldItem label="展开触发">
        <w.ButtonGroup
          value={(values.expandTrigger as string) ?? 'click'}
          onChange={(v) => onChange('expandTrigger', v)}
          options={[
            { label: '点击', value: 'click' },
            { label: '悬停', value: 'hover' },
          ]}
        />
      </FieldItem>
    </>
  )
}
