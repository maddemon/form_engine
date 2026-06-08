import { useCallback } from 'react'
import { useLocale } from '../../locale'
import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor, WidgetButton } from '../../widgets'
import type { TabPaneConfig } from '.'

export default function TabsPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const tabs = (values.tabs as TabPaneConfig[]) ?? []
  const defaultActiveKey = values.defaultActiveKey as string | undefined

  const handleTabsChange = useCallback(
    (newTabs: TabPaneConfig[]) => {
      if (defaultActiveKey && !newTabs.some((t) => t.key === defaultActiveKey)) {
        onChange('tabs', newTabs)
        onChange('defaultActiveKey', undefined)
      } else {
        onChange('tabs', newTabs)
      }
    },
    [defaultActiveKey, onChange],
  )

  const handleAddTab = useCallback(() => {
    handleTabsChange([
      ...tabs,
      { id: genId('tab'), key: `tab_${tabs.length + 1}`, title: `标签页${tabs.length + 1}`, disabled: false },
    ])
  }, [tabs, handleTabsChange])

  return (
    <>
      <FieldItem label={locale.component.tabs.type}>
        <w.ButtonGroup
          value={(values.type as string) ?? 'line'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: locale.component.tabs.line, value: 'line' },
            { label: locale.component.tabs.card, value: 'card' },
            { label: locale.component.tabs.editableCard, value: 'editable-card' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.tabs.size}>
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: locale.component.tabs.large, value: 'large' },
            { label: locale.component.tabs.medium, value: 'middle' },
            { label: locale.component.tabs.small, value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.tabs.position}>
        <w.ButtonGroup
          value={(values.tabPosition as string) ?? 'top'}
          onChange={(v) => onChange('tabPosition', v)}
          options={[
            { label: locale.component.tabs.top, value: 'top' },
            { label: locale.component.tabs.right, value: 'right' },
            { label: locale.component.tabs.bottom, value: 'bottom' },
            { label: locale.component.tabs.left, value: 'left' },
          ]}
        />
      </FieldItem>
      <FieldItem label={locale.component.tabs.centered}>
        <w.Switch checked={!!values.centered} onChange={(v) => onChange('centered', v)} />
      </FieldItem>
      <FieldItem label={locale.component.tabs.tabMgmt} variant="group">
        <SortableTableEditor<TabPaneConfig>
          value={tabs}
          onChange={handleTabsChange}
          columns={[
            {
              key: 'title',
              label: locale.component.tabs.title,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'key',
              label: locale.component.tabs.key,
              render: ({ value, onChange: onValChange, disabled: d }) => (
                <w.Input value={String(value ?? '')} disabled={d} variant="filled" onChange={(v) => onValChange(v)} />
              ),
            },
            {
              key: 'disabled',
              label: locale.component.tabs.disabled,
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
          onClick={handleAddTab}
          style={{ width: '100%', marginTop: 4 }}
        >
          + {locale.component.tabs.addTab}
        </WidgetButton>
      </FieldItem>
    </>
  )
}
