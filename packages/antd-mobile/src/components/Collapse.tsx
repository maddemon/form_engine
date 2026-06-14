import type { FormFieldSchema } from '@form-engine/core'
import { useAdapter, type CollapsePanelConfig, type CollapseProps } from '@form-engine/core'
import { defaultFieldRenderer } from '@form-engine/core/styles'
import { Collapse as AntmCollapse } from 'antd-mobile'
import React from 'react'

export const Collapse: React.FC<CollapseProps> = ({
  fieldSchema,
  children: reactChildren,
  panels = [],
  accordion = false,
  activeKey,
  defaultActiveKey,
}) => {
  const adapter = useAdapter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fieldSchema is passed by renderer internally, not in CollapseProps public type
  const schemaChildren: FormFieldSchema[] = (fieldSchema as any)?.children ?? []

  if (reactChildren) {
    const childrenArray = React.Children.toArray(reactChildren)
    return (
      <AntmCollapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey} panels={[]}>
        {(panels as CollapsePanelConfig[]).map((panel) => {
          const panelReactChildren = childrenArray.filter((child) => {
            const el = child as React.ReactElement<Record<string, unknown>>
            const elProps = el.props ?? {}
            const field = elProps.field as Record<string, unknown> | undefined
            return field?.regionKey === panel.key
          })
          return (
            <AntmCollapse.Panel key={panel.key} title={panel.header}>
              {panelReactChildren}
            </AntmCollapse.Panel>
          )
        })}
      </AntmCollapse>
    )
  }

  return (
    <AntmCollapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {(panels as CollapsePanelConfig[]).map((panel) => {
        const panelChildren = schemaChildren.filter((c) => c.regionKey === panel.key)
        return (
          <AntmCollapse.Panel key={panel.key} title={panel.header}>
            {panelChildren.map((child) => {
              const renderFn = adapter?.components[child.type]
              return renderFn ? (
                React.createElement(renderFn, { fieldSchema: child, key: child.id } as any)
              ) : (
                <React.Fragment key={child.id}>{defaultFieldRenderer({ fieldSchema: child, value: undefined, onChange: () => {} })}</React.Fragment>
              )
            })}
          </AntmCollapse.Panel>
        )
      })}
    </AntmCollapse>
  )
}
