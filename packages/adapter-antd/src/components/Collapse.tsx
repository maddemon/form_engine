/**
 * Antd Collapse 组件
 * 适配 Form Engine（panels + regionKey 模式）
 * 使用 Ant Design 的 Collapse 组件
 */

import type { CollapsePanelConfig, CollapseProps } from '@form-engine/core'
import { Collapse as AntCollapse } from 'antd'
import React from 'react'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      {...rest}
    >
      {panelConfigs.map((panel, idx) => {
        const panelChildren = childrenArray.filter((child) => {
          const el = child as React.ReactElement<Record<string, unknown>>
          const props = el.props ?? {}
          const field = props.field as Record<string, unknown> | undefined
          return field?.regionKey === panel.key || Number(field?.columnIndex ?? -1) === idx
        })
        return (
          <AntPanel key={panel.key} header={panel.header}>
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
