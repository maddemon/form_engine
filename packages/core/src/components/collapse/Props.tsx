import { useCallback, useMemo } from 'react'
import { FieldItem, ItemListEditor, genId } from '../../propRenders'
import type { PropsRenderProps } from '../../propRenders/types'
import type { CollapsePanelConfig } from './types'

export default function CollapsePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const panels = (values.panels as CollapsePanelConfig[]) ?? []
  const defaultActiveKey = values.defaultActiveKey as string | string[] | undefined

  const collectActiveKeys = useCallback((v: string | string[] | undefined): string[] => {
    if (!v) return []
    if (Array.isArray(v)) return v
    return v.split(',').map(s => s.trim()).filter(Boolean)
  }, [])

  const handlePanelsChange = useCallback((newPanels: CollapsePanelConfig[]) => {
    const existingKeys = new Set(newPanels.map(p => p.key))
    const activeKeys = collectActiveKeys(defaultActiveKey)
    // 筛选出仍然存在的 key
    const remainingKeys = activeKeys.filter(k => existingKeys.has(k))

    // 先改 panels
    onChange('panels', newPanels)

    if (remainingKeys.length < activeKeys.length) {
      // 部分 key 已被删除，同步更新 defaultActiveKey
      if (remainingKeys.length === 0) {
        onChange('defaultActiveKey', undefined)
      } else if (Array.isArray(defaultActiveKey)) {
        onChange('defaultActiveKey', remainingKeys)
      } else {
        onChange('defaultActiveKey', remainingKeys[0])
      }
    }
  }, [defaultActiveKey, onChange, collectActiveKeys])

  return (
    <>
      <FieldItem label="手风琴模式">
        <w.Switch checked={!!values.accordion} onChange={(v) => onChange('accordion', v)} />
      </FieldItem>
      <FieldItem label="简洁模式">
        <w.Switch checked={!!values.ghost} onChange={(v) => onChange('ghost', v)} />
      </FieldItem>
      <FieldItem label="默认展开">
        <w.Input value={(values.defaultActiveKey as string) ?? ''} onChange={(v) => onChange('defaultActiveKey', v)} placeholder="面板 key，多个用逗号" />
      </FieldItem>
      <FieldItem label="面板管理" variant="group">
        <ItemListEditor<CollapsePanelConfig>
          value={panels}
          onChange={handlePanelsChange}
          fields={[
            { key: 'header', label: '标题', kind: 'text', placeholder: '面板标题' },
            { key: 'key', label: 'Key', kind: 'text', placeholder: '唯一标识', unique: true },
            { key: 'disabled', label: '禁用', kind: 'switch', flex: 0 },
          ]}
          newItem={() => ({ id: genId('panel'), key: `panel_${(panels?.length || 0) + 1}`, header: `面板${(panels?.length || 0) + 1}`, disabled: false })}
          validateUnique={(items) => {
            const keys = items.map(x => x.key).filter(Boolean)
            const dup = keys.find((k, i) => keys.indexOf(k) !== i)
            return dup ? `面板 key "${dup}" 重复，请保证唯一` : null
          }}
          minItems={1}
          addLabel="添加面板"
          layout="table"
          widgets={{ Input: w.Input, NumberInput: w.NumberInput, Switch: w.Switch }}
        />
      </FieldItem>
    </>
  )
}