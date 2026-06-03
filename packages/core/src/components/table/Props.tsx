import { FieldItem, ItemListEditor, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import type { TableColumnConfig } from './types'

export default function TablePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const columns = (values.columns as TableColumnConfig[]) ?? []
  const rowMode = (values.rowMode as string) ?? 'dynamic'

  return (
    <>
      <FieldItem label="行模式">
        <w.ButtonGroup
          value={rowMode}
          onChange={(v) => onChange('rowMode', v)}
          options={[
            { label: '动态', value: 'dynamic' },
            { label: '固定', value: 'fixed' },
          ]}
        />
      </FieldItem>
      {rowMode === 'fixed' && (
        <FieldItem label="固定行数">
          <w.NumberInput value={(values.fixedRowCount as number) ?? 3} onChange={(v) => onChange('fixedRowCount', v)} min={1} max={100} />
        </FieldItem>
      )}
      <FieldItem label="列管理" variant="group">
        <ItemListEditor<TableColumnConfig>
          value={columns}
          onChange={(v) => onChange('columns', v)}
          fields={[
            { key: 'label', label: '列标题', kind: 'text', placeholder: '列标题' },
            { key: 'width', label: '宽度(px)', kind: 'number', min: 20, max: 2000, step: 10, placeholder: 'px' },
          ]}
          newItem={() => ({ id: genId('col'), label: `列${(columns?.length || 0) + 1}`, width: 120 })}
          minItems={1}
          addLabel="添加列"
        />
      </FieldItem>
    </>
  )
}