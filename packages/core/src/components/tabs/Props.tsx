import { useCallback } from 'react'
import { FieldItem, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import { SortableTableEditor } from '../../widgets'
import type { TabPaneConfig } from './types'

export default function TabsPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
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

  return (
    <>
      <FieldItem label="样式类型">
        <w.ButtonGroup
          value={(values.type as string) ?? 'line'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '线框', value: 'line' },
            { label: '卡片', value: 'card' },
            { label: '可编辑卡片', value: 'editable-card' },
          ]}
        />
      </FieldItem>
      <FieldItem label="尺寸">
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldItem>
      <FieldItem label="标签位置">
        <w.ButtonGroup
          value={(values.tabPosition as string) ?? 'top'}
          onChange={(v) => onChange('tabPosition', v)}
          options={[
            { label: '顶部', value: 'top' },
            { label: '右侧', value: 'right' },
            { label: '底部', value: 'bottom' },
            { label: '左侧', value: 'left' },
          ]}
        />
      </FieldItem>
      <FieldItem label="居中展示">
        <w.Switch checked={!!values.centered} onChange={(v) => onChange('centered', v)} />
      </FieldItem>
      <FieldItem label="标签页管理" variant="group">
        <SortableTableEditor<TabPaneConfig>
          value={tabs}
          onChange={handleTabsChange}
          columns={[
            {
              key: 'title',
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
          newItem={() => ({
            id: genId('tab'),
            key: `tab_${(tabs?.length || 0) + 1}`,
            title: `标签页${(tabs?.length || 0) + 1}`,
            disabled: false,
          })}
          minItems={1}
          addLabel="添加标签页"
        />
      </FieldItem>
    </>
  )
}
