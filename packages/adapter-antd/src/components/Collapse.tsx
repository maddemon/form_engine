/**
 * Antd Collapse 组件
 * 适配 Form Engine
 * 使用 Ant Design 的 Collapse 组件
 */

import React from 'react'
import { Collapse as AntCollapse } from 'antd'
import type { CollapseProps } from '@form-engine/core'

const { Panel } = AntCollapse

/**
 * Collapse 组件
 */
export const Collapse: React.FC<CollapseProps> = ({
  children,
  activeKey,
  defaultActiveKey,
  onChange,
  accordion = false,
  ghost = false,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (key: string | string[]) => {
    onChange?.(key)
  }
  
  return (
    <AntCollapse
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onChange={handleChange}
      accordion={accordion}
      ghost={ghost}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {children}
    </AntCollapse>
  )
}

/**
 * CollapsePanel 组件
 */
export const CollapsePanel: React.FC<CollapsePanelProps> = ({
  children,
  key,
  header,
  disabled = false,
  showArrow = true,
  extra,
  style,
  className,
  ...rest
}) => {
  return (
    <Panel
      key={key}
      header={header}
      disabled={disabled}
      showArrow={showArrow}
      extra={extra}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </Panel>
  )
}

/** CollapsePanel Props */
interface CollapsePanelProps {
  children?: React.ReactNode
  key: string
  header: React.ReactNode
  disabled?: boolean
  showArrow?: boolean
  extra?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  [key: string]: any
}
