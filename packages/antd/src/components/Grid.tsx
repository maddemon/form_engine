/**
 * Antd Grid 组件
 * 适配 Form Engine 的 GridProps（colSpans 模式）
 * 使用 Ant Design 的 Row 和 Col
 */

import type { GridProps } from '@form-engine/core'
import { useAdapter } from '@form-engine/core'
import { Col, Row } from 'antd'
import React from 'react'

/**
 * Grid 组件
 * 提供栅格布局
 * 移动端无视列数，直接垂直平铺
 */
export const Grid: React.FC<GridProps> = ({ children, colSpans, gap = 8, style, className, id, ...rest }) => {
  const adapter = useAdapter()
  const isMobile = adapter?.scene === 'mobile'
  const childrenArray = React.Children.toArray(children)
  const gapValue = typeof gap === 'number' ? gap : 8

  if (isMobile) {
    return (
      <div style={{ width: '100%', ...style }} className={className} id={id}>
        {childrenArray.map((child, index) => (
          <div key={index} style={{ width: '100%', marginBottom: index < childrenArray.length - 1 ? gapValue : 0 }}>
            {child}
          </div>
        ))}
      </div>
    )
  }

  const spans = colSpans?.filter(Boolean) ?? []
  //const totalSpan = spans.reduce((s, c) => s + (c.span || 0), 0) || 24

  if (spans.length === 0) {
    const childCount = childrenArray.length || 1
    const colSpan = Math.floor(24 / childCount)
    return (
      <Row gutter={gap} style={style} className={className} id={id} {...rest}>
        {childrenArray.map((child, index) => (
          <Col key={index} span={colSpan}>
            {child}
          </Col>
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
