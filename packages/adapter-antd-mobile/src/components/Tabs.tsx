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
  const { fieldSchema } = props
  const adapter = useAdapter()
  const tabs: TabConfig[] = (fieldSchema.componentProps?.tabs as TabConfig[]) ?? []
  const children: FormFieldSchema[] = fieldSchema.children ?? []
  const activeKey = fieldSchema.componentProps?.activeKey as string | undefined
  const defaultActiveKey = fieldSchema.componentProps?.defaultActiveKey as string | undefined

  return (
    <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {tabs.map((tab) => {
        const tabChildren = children.filter((c) => c.regionKey === tab.key)
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