import { useCallback } from 'react'
import { FieldItem, ItemListEditor, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import type { TabPaneConfig } from './types'

export default function TabsPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const tabs = (values.tabs as TabPaneConfig[]) ?? []
  const defaultActiveKey = values.defaultActiveKey as string | undefined

  const handleTabsChange = useCallback((newTabs: TabPaneConfig[]) => {
    // defaultActiveKey 同步
    if (defaultActiveKey && !newTabs.some(t => t.key === defaultActiveKey)) {
      // defaultActiveKey 指向的 key 已被删除，清空
      onChange('tabs', newTabs)
      onChange('defaultActiveKey', undefined)
    } else {
      // 未设置或仍匹配，不动
      onChange('tabs', newTabs)
    }
  }, [defaultActiveKey, onChange])

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
        <ItemListEditor<TabPaneConfig>
          value={tabs}
          onChange={handleTabsChange}
          fields={[
            { key: 'title', label: '标题', kind: 'text', placeholder: '标签标题' },
            { key: 'key', label: 'Key', kind: 'text', placeholder: '唯一标识', unique: true },
            { key: 'disabled', label: '禁用', kind: 'switch', flex: 0 },
          ]}
          newItem={() => ({ id: genId('tab'), key: `tab_${(tabs?.length || 0) + 1}`, title: `标签页${(tabs?.length || 0) + 1}`, disabled: false })}
          validateUnique={(items) => {
            const keys = items.map(x => x.key).filter(Boolean)
            const dup = keys.find((k, i) => keys.indexOf(k) !== i)
            return dup ? `标签页 key "${dup}" 重复，请保证唯一` : null
          }}
          minItems={1}
          addLabel="添加标签页"
        />
      </FieldItem>
    </>
  )
}