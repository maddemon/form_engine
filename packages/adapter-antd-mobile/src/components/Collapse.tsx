import React from 'react'
import { Collapse } from 'antd-mobile'
import { useAdapter, type FieldComponentProps, type FieldRendererFn } from '@form-engine/core'
import type { FormFieldSchema } from '@form-engine/core'

interface PanelConfig {
  key: string
  header: string
  disabled?: boolean
}

export const CollapseField: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema } = props
  const adapter = useAdapter()
  const panels: PanelConfig[] = (fieldSchema.componentProps?.panels as PanelConfig[]) ?? []
  const accordion = fieldSchema.componentProps?.accordion as boolean | undefined ?? false
  const children: FormFieldSchema[] = fieldSchema.children ?? []
  const activeKey = fieldSchema.componentProps?.activeKey as string | string[] | undefined
  const defaultActiveKey = fieldSchema.componentProps?.defaultActiveKey as string | string[] | undefined

  return (
    <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {panels.map((panel) => {
        const panelChildren = children.filter((c) => c.regionKey === panel.key)
        return (
          <Collapse.Panel key={panel.key} title={panel.header}>
            {panelChildren.map((child) => {
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