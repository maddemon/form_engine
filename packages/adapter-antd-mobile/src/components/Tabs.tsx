import React from 'react'
import { Tabs } from 'antd-mobile'
import { useAdapter, type FieldComponentProps, type FieldRendererFn } from '@form-engine/core'
import type { FormFieldSchema } from '@form-engine/core'

interface TabConfig {
  key: string
  title: string
  disabled?: boolean
}

export const TabsField: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema, children: reactChildren } = props
  const adapter = useAdapter()
  const tabs: TabConfig[] = (fieldSchema.componentProps?.tabs as TabConfig[]) ?? []
  const schemaChildren: FormFieldSchema[] = fieldSchema.children ?? []
  const activeKey = fieldSchema.componentProps?.activeKey as string | undefined
  const defaultActiveKey = fieldSchema.componentProps?.defaultActiveKey as string | undefined

  // 当有 react children（设计器注入的 RegionDroppable）时，按 regionKey 分配到各 tab
  if (reactChildren) {
    const childrenArray = React.Children.toArray(reactChildren)
    return (
      <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
        {tabs.map((tab) => {
          const tabReactChildren = childrenArray.filter((child) => {
            const el = child as React.ReactElement<Record<string, unknown>>
            const elProps = el.props ?? {}
            const field = elProps.field as Record<string, unknown> | undefined
            return field?.regionKey === tab.key
          })
          return (
            <Tabs.Tab title={tab.title} key={tab.key}>
              {tabReactChildren}
            </Tabs.Tab>
          )
        })}
      </Tabs>
    )
  }

  // 无 react children（运行时渲染）：按 fieldSchema.children 渲染
  return (
    <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {tabs.map((tab) => {
        const tabChildren = schemaChildren.filter((c) => c.regionKey === tab.key)
        return (
          <Tabs.Tab title={tab.title} key={tab.key}>
            {tabChildren.map((child) => {
              const renderFn = adapter?.components[child.type]
              return renderFn
                ? React.createElement(renderFn, { ...props, fieldSchema: child, key: child.id })
                : <div key={child.id} style={{ color: '#ccc', fontSize: 12 }}>未知类型: {child.type}</div>
            })}
          </Tabs.Tab>
        )
      })}
    </Tabs>
  )
}