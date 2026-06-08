import { useCallback } from 'react'
import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor, WidgetButton } from '../../widgets'
import type { CollapsePanelConfig } from '.'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const panels = (values.panels as CollapsePanelConfig[]) ?? []
  const defaultActiveKey = values.defaultActiveKey as string | string[] | undefined

  const collectActiveKeys = useCallback((v: string | string[] | undefined): string[] => {
    if (!v) return []
    if (Array.isArray(v)) return v
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }, [])

  const handlePanelsChange = useCallback(
    (newPanels: CollapsePanelConfig[]) => {
      const existingKeys = new Set(newPanels.map((p) => p.key))
      const activeKeys = collectActiveKeys(defaultActiveKey)
      const remainingKeys = activeKeys.filter((k) => existingKeys.has(k))

      onChange('panels', newPanels)

      if (remainingKeys.length < activeKeys.length) {
        if (remainingKeys.length === 0) {
          onChange('defaultActiveKey', undefined)
        } else if (Array.isArray(defaultActiveKey)) {
          onChange('defaultActiveKey', remainingKeys)
        } else {
          onChange('defaultActiveKey', remainingKeys[0])
        }
      }
    },
    [defaultActiveKey, onChange, collectActiveKeys],
  )

  const handleAddPanel = useCallback(() => {
    handlePanelsChange([
      ...panels,
      { id: genId('panel'), key: `panel_${panels.length + 1}`, header: `面板${panels.length + 1}`, disabled: false },
    ])
  }, [panels, handlePanelsChange])

  return (
    <>
      <FieldItem label="手风琴模式">
        <w.Switch checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </FieldItem>
      <FieldItem label="简洁模式">
        <w.Switch checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </FieldItem>
      <FieldItem label="默认展开">
        <w.Input
          value={(values.defaultActiveKey as string) ?? ''}
          onChange={(v) => onChange('defaultActiveKey', v)}
          placeholder="面板 key，多个用逗号"
        />
      </FieldItem>
      <FieldItem label="面板管理" variant="group">
        <SortableTableEditor<CollapsePanelConfig>
          value={panels}
          onChange={handlePanelsChange}
          columns={[
            {
              key: 'header',
              label: '标题',
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'key',
              label: 'Key',
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'disabled',
              label: '禁用',
              width: 40,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Switch checked={!!value} disabled={d} onChange={(v) => onValChange(v)} />
              ),
            },
          ]}
          minItems={1}
        />
        <WidgetButton
          type="dashed"
          color="primary"
          size="sm"
          onClick={handleAddPanel}
          style={{ width: '100%', marginTop: 4 }}
        >
          + 添加面板
        </WidgetButton>
      </FieldItem>
    </>
  )
}
