import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor } from '../../widgets'
import type { SubFormColumnConfig } from './types'

export default function SubFormPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const columns = (values.columns as SubFormColumnConfig[]) ?? []
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
          <w.NumberInput
            value={(values.fixedRowCount as number) ?? 3}
            onChange={(v) => onChange('fixedRowCount', v)}
            min={1}
            max={100}
          />
        </FieldItem>
      )}
      <FieldItem label="列管理" variant="group">
        <SortableTableEditor<SubFormColumnConfig>
          value={columns}
          onChange={(v) => onChange('columns', v)}
          columns={[
            {
              key: 'label',
              label: '列标题',
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'width',
              label: '宽度(px)',
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.NumberInput
                  value={value as number | undefined}
                  disabled={d}
                  min={20}
                  max={2000}
                  variant="filled"
                  onChange={(v) => onValChange(v)}
                />
              ),
            },
          ]}
          newItem={() => ({ id: genId('col'), label: `列${(columns?.length || 0) + 1}`, width: 120 })}
          minItems={1}
          addLabel="添加列"
        />
      </FieldItem>
    </>
  )
}
