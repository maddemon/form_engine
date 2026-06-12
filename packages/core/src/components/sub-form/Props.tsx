import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import { genId } from '../../utils/id'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor, WidgetButton } from '../../widgets'
import type { SubFormColumnConfig } from '.'

export default function SubFormPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const columns = (values.columns as SubFormColumnConfig[]) ?? []
  const rowMode = (values.rowMode as string) ?? 'dynamic'

  function handleAddColumn() {
    onChange('columns', [...columns, { id: genId('col'), label: locale.component.subForm.defaultColumnLabel.replace('{n}', String((columns?.length || 0) + 1)), width: 120 }])
  }

  return (
    <>
      <FieldItem label={locale.component.subForm.rowMode}>
        <w.ButtonGroup
          value={rowMode}
          onChange={(v) => onChange('rowMode', v)}
          options={[
            { label: locale.component.subForm.dynamic, value: 'dynamic' },
            { label: locale.component.subForm.fixed, value: 'fixed' },
          ]}
        />
      </FieldItem>
      {rowMode === 'fixed' && (
        <FieldItem label={locale.component.subForm.fixedRows}>
          <w.NumberInput
            value={(values.fixedRowCount as number) ?? 3}
            onChange={(v) => onChange('fixedRowCount', v)}
            min={1}
            max={100}
          />
        </FieldItem>
      )}
      <FieldItem label={locale.component.subForm.columnMgmt} variant="group">
        <SortableTableEditor<SubFormColumnConfig>
          value={columns}
          onChange={(v) => onChange('columns', v)}
          columns={[
            {
              key: 'label',
              label: locale.component.subForm.columnTitle,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'width',
              label: locale.component.subForm.columnWidth,
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
          minItems={1}
        />
        <WidgetButton
          type="dashed"
          color="primary"
          size="sm"
          onClick={handleAddColumn}
          style={{ width: '100%', marginTop: 4 }}
        >
          + {locale.component.subForm.addColumn}
        </WidgetButton>
      </FieldItem>
    </>
  )
}
