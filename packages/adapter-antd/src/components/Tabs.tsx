/**
 * Antd Tabs 组件
 * 适配 Form Engine（tabs + regionKey 模式）
 * 使用 Ant Design 的 Tabs 组件
 */

import React from 'react'
import { Tabs as AntTabs } from 'antd'
import type { TabsProps, TabPaneConfig } from '@form-engine/core'

/**
 * Tabs 组件
 * children 通过 regionKey 关联到 tabs 中对应 tab
 */
export const Tabs: React.FC<TabsProps> = ({
  children,
  tabs,
  activeKey,
  defaultActiveKey,
  onChange,
  type = 'line',
  size = 'middle',
  tabPosition = 'top',
  centered = false,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (key: string) => {
    onChange?.(key)
  }

  const childrenArray = React.Children.toArray(children)
  const tabConfigs = (tabs ?? []) as TabPaneConfig[]

  return (
    <AntTabs
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onChange={handleChange}
      type={type}
      size={size}
      tabPosition={tabPosition}
      centered={centered}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {tabConfigs.map((tab, idx) => {
        const tabChildren = childrenArray.filter((child) => {
          const el = child as React.ReactElement<Record<string, unknown>>
          const props = el.props ?? {}
          const field = props.field as Record<string, unknown> | undefined
          return field?.regionKey === tab.key || Number(field?.columnIndex ?? -1) === idx
        })
        return (
          <AntTabs.TabPane key={tab.key} tab={tab.title}>
            {tabChildren}
          </AntTabs.TabPane>
        )
      })}
    </AntTabs>
  )
}

/** TabPane Props */
interface TabPaneProps {
  children?: React.ReactNode
  key: string
  tab: React.ReactNode
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
}

/**
 * TabPane 组件（保留导出兼容）
 */
export const TabPane: React.FC<TabPaneProps> = ({
  children,
  key,
  tab,
  disabled = false,
  style,
  className,
  ...rest
}) => {
  return (
    <AntTabs.TabPane
      key={key}
      tab={tab}
      disabled={disabled}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </AntTabs.TabPane>
  )
}