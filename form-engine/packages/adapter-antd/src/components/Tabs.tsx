/**
 * Antd Tabs 组件
 * 适配 Form Engine
 * 使用 Ant Design 的 Tabs 组件
 */

import React from 'react'
import { Tabs as AntTabs } from 'antd'
import type { TabsProps } from '@form-engine/core'

/**
 * Tabs 组件
 */
export const Tabs: React.FC<TabsProps> = ({
  children,
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
      {children}
    </AntTabs>
  )
}

/**
 * TabPane 组件
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

/** TabPane Props */
interface TabPaneProps {
  children?: React.ReactNode
  key: string
  tab: React.ReactNode
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
  [key: string]: any
}

/** Tabs Props */
interface TabsProps {
  children?: React.ReactNode
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (key: string) => void
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  centered?: boolean
  style?: React.CSSProperties
  className?: string
  id?: string
  [key: string]: any
}
