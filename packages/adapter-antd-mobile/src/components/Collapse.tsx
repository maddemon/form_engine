import React from 'react'
import { Collapse } from 'antd-mobile'
import { useAdapter, type FieldRendererFn } from '@form-engine/core'

export const CollapseField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  const adapter = useAdapter()
  const panels = fieldSchema?.componentProps?.panels ?? []
  const accordion = fieldSchema?.componentProps?.accordion ?? false
  const children = fieldSchema?.children ?? []
  const activeKey = fieldSchema?.componentProps?.activeKey
  const defaultActiveKey = fieldSchema?.componentProps?.defaultActiveKey

  return (
    <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {panels.map((panel: any) => {
        const panelChildren = children.filter((c: any) => c.regionKey === panel.key)
        return (
          <Collapse.Panel key={panel.key} title={panel.header}>
            {panelChildren.map((child: any) => {
              const renderFn = adapter?.components[child.type]
              return renderFn
                ? React.createElement(renderFn, { ...props, fieldSchema: child, key: child.id })
                : <div key={child.id} style={{ color: '#ccc', fontSize: 12 }}>未知类型: {child.type}</div>
            })}
          </Collapse.Panel>
        )
      })}
    </Collapse>
  )
}