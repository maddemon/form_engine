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
  const { fieldSchema, children: reactChildren } = props
  const adapter = useAdapter()
  const panels: PanelConfig[] = (fieldSchema.componentProps?.panels as PanelConfig[]) ?? []
  const accordion = fieldSchema.componentProps?.accordion as boolean | undefined ?? false
  const schemaChildren: FormFieldSchema[] = fieldSchema.children ?? []
  const activeKey = fieldSchema.componentProps?.activeKey as string | string[] | undefined
  const defaultActiveKey = fieldSchema.componentProps?.defaultActiveKey as string | string[] | undefined

  // 当有 react children（设计器注入的 RegionDroppable）时，按 regionKey 分配到各 panel
  if (reactChildren) {
    const childrenArray = React.Children.toArray(reactChildren)
    return (
      <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
        {panels.map((panel) => {
          const panelReactChildren = childrenArray.filter((child) => {
            const el = child as React.ReactElement<Record<string, unknown>>
            const elProps = el.props ?? {}
            const field = elProps.field as Record<string, unknown> | undefined
            return field?.regionKey === panel.key
          })
          return (
            <Collapse.Panel key={panel.key} title={panel.header}>
              {panelReactChildren}
            </Collapse.Panel>
          )
        })}
      </Collapse>
    )
  }

  // 无 react children（运行时渲染）：按 fieldSchema.children 渲染
  return (
    <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {panels.map((panel) => {
        const panelChildren = schemaChildren.filter((c) => c.regionKey === panel.key)
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