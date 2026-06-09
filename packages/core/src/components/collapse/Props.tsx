import { useCallback } from 'react'
import { useLocale } from '../../locale'
import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor, WidgetButton } from '../../widgets'
import type { CollapsePanelConfig } from '.'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
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
      { id: genId('panel'), key: `panel_${panels.length + 1}`, header: locale.component.collapse.defaultPanelHeader.replace('{n}', String(panels.length + 1)), disabled: false },
    ])
  }, [panels, handlePanelsChange, locale])

  return (
    <>
      <FieldItem label={locale.component.collapse.accordion}>
        <w.Switch checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </FieldItem>
      <FieldItem label={locale.component.collapse.ghost}>
        <w.Switch checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </FieldItem>
      <FieldItem label={locale.component.collapse.defaultActive}>
        <w.Input
          value={(values.defaultActiveKey as string) ?? ''}
          onChange={(v) => onChange('defaultActiveKey', v)}
          placeholder={locale.component.collapse.defaultActivePlaceholder}
        />
      </FieldItem>
      <FieldItem label={locale.component.collapse.panelMgmt} variant="group">
        <SortableTableEditor<CollapsePanelConfig>
          value={panels}
          onChange={handlePanelsChange}
          columns={[
            {
              key: 'header',
              label: locale.component.collapse.header,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'key',
              label: locale.component.collapse.key,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'disabled',
              label: locale.component.collapse.disabled,
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
          + {locale.component.collapse.addPanel}
        </WidgetButton>
      </FieldItem>
    </>
  )
}
