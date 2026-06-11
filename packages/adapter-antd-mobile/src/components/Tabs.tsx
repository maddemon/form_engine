import { useAdapter, type FormFieldSchema, type TabsProps } from '@form-engine/core'
import { defaultFieldRenderer } from '@form-engine/core/styles'
import { Tabs as AntmTabs } from 'antd-mobile'
import React from 'react'

export const Tabs: React.FC<TabsProps> = ({
  fieldSchema,
  children: reactChildren,
  tabs = [],
  activeKey,
  defaultActiveKey,
  onChange,
  style,
  className,
}) => {
  const adapter = useAdapter()
  const schemaChildren: FormFieldSchema[] = (fieldSchema as any)?.children ?? []

  if (reactChildren) {
    const childrenArray = React.Children.toArray(reactChildren)
    return (
      <AntmTabs
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey}
        onChange={onChange}
        style={style}
        className={className}
      >
        {tabs.map((tab) => {
          const tabReactChildren = childrenArray.filter((child) => {
            const el = child as React.ReactElement<Record<string, unknown>>
            const elProps = el.props ?? {}
            const field = elProps.field as Record<string, unknown> | undefined
            return field?.regionKey === tab.key
          })
          return (
            <AntmTabs.Tab title={tab.title} key={tab.key}>
              {tabReactChildren}
            </AntmTabs.Tab>
          )
        })}
      </AntmTabs>
    )
  }

  return (
    <AntmTabs
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
      style={style}
      className={className}
    >
      {tabs.map((tab) => {
        const tabChildren = schemaChildren.filter((c) => c.regionKey === tab.key)
        return (
          <AntmTabs.Tab title={tab.title} key={tab.key}>
            {tabChildren.map((child) => {
              const renderFn = adapter?.components[child.type]
              return renderFn ? (
                React.createElement(renderFn, { fieldSchema: child, key: child.id } as any)
              ) : (
                <React.Fragment key={child.id}>{defaultFieldRenderer({ fieldSchema: child, value: undefined, onChange: () => {} })}</React.Fragment>
              )
            })}
          </AntmTabs.Tab>
        )
      })}
    </AntmTabs>
  )
}
