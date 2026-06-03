import React from 'react'
import { Tabs } from 'antd-mobile'
import { useAdapter, type FieldRendererFn } from '@form-engine/core'

export const TabsField: FieldRendererFn = (props: any) => {
  const { fieldSchema } = props
  const adp = useAdapter() ?? (props as any).adapter
  const tabs = fieldSchema?.componentProps?.tabs ?? []
  const children = fieldSchema?.children ?? []
  const activeKey = fieldSchema?.componentProps?.activeKey
  const defaultActiveKey = fieldSchema?.componentProps?.defaultActiveKey

  return (
    <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {tabs.map((tab: any) => {
        const tabChildren = children.filter((c: any) => c.regionKey === tab.key)
        return (
          <Tabs.Tab title={tab.title} key={tab.key}>
            {tabChildren.map((child: any) => {
              const renderFn = adp?.[child.type]
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