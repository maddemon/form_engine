/**
 * Antd Collapse 组件
 * 适配 Form Engine（panels + regionKey 模式）
 * 使用 Ant Design 的 Collapse 组件
 */

import React from 'react'
import { Collapse as AntCollapse } from 'antd'
import type { CollapseProps, CollapsePanelConfig } from '@form-engine/core'

const { Panel: AntPanel } = AntCollapse

/**
 * Collapse 组件
 * children 通过 regionKey 关联到 panels 中对应 panel
 */
export const Collapse: React.FC<CollapseProps> = ({
  children,
  panels,
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

  const childrenArray = React.Children.toArray(children)
  const panelConfigs = (panels ?? []) as CollapsePanelConfig[]

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
      {panelConfigs.map((panel, idx) => {
        const panelChildren = childrenArray.filter((child: any) =>
          child.props?.field?.regionKey === panel.key ||
          Number(child.props?.field?.columnIndex ?? -1) === idx
        )
        return (
          <AntPanel key={panel.key} header={panel.header} disabled={panel.disabled}>
            {panelChildren}
          </AntPanel>
        )
      })}
    </AntCollapse>
  )
}

/** CollapsePanel Props */
interface CollapsePanelProps {
  children?: React.ReactNode
  key: string
  header: React.ReactNode
  showArrow?: boolean
  extra?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  [key: string]: any
}

/**
 * CollapsePanel 组件（保留导出兼容）
 */
export const CollapsePanel: React.FC<CollapsePanelProps> = ({
  children,
  key,
  header,
  showArrow = true,
  extra,
  style,
  className,
  ...rest
}) => {
  return (
    <AntPanel
      key={key}
      header={header}
      showArrow={showArrow}
      extra={extra}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </AntPanel>
  )
}