/**
 * Antd Grid 组件
 * 适配 Form Engine 的 GridProps（colSpans 模式）
 * 使用 Ant Design 的 Row 和 Col
 */

import React from 'react'
import { Row, Col } from 'antd'
import type { GridProps } from '@form-engine/core'

/**
 * Grid 组件
 * 提供栅格布局
 */
export const Grid: React.FC<GridProps> = ({
  children,
  colSpans,
  gap = 8,
  style,
  className,
  id,
  ...rest
}) => {
  const childrenArray = React.Children.toArray(children)
  const spans = colSpans?.filter(Boolean) ?? []
  const totalSpan = spans.reduce((s, c) => s + (c.span || 0), 0) || 24

  if (spans.length === 0) {
    // 无配置时兜底：等分
    const childCount = childrenArray.length || 1
    const colSpan = Math.floor(24 / childCount)
    return (
      <Row gutter={gap} style={style} className={className} id={id} {...rest}>
        {childrenArray.map((child, index) => (
          <Col key={index} span={colSpan}>{child}</Col>
        ))}
      </Row>
    )
  }

  return (
    <Row gutter={gap} style={style} className={className} id={id} {...rest}>
      {spans.map((col, index) => {
        const colChildren = childrenArray[index]
        return (
          <Col key={col.id} span={col.span}>
            {colChildren || null}
          </Col>
        )
      })}
    </Row>
  )
}