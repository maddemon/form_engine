/**
 * Antd Grid 组件
 * 适配 Form Engine 的 GridProps
 * 使用 Ant Design 的 Row 和 Col
 */

import React from 'react'
import { Row, Col } from 'antd'
import type { GridProps, GridColConfig } from '@form-engine/core'

/**
 * Grid 组件
 * 提供栅格布局
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = 2,
  gap = 8,
  rows,
  cols,
  style,
  className,
  id,
  ...rest
}) => {
  const childrenArray = React.Children.toArray(children)
  const childCount = childrenArray.length || 1
  const colSpan = Math.floor(24 / columns)

  if (cols && cols.length > 0) {
    return (
      <Row
        gutter={gap}
        style={style}
        className={className}
        id={id}
        {...rest}
      >
        {childrenArray.map((child, index) => {
          const colConfig = cols[index] || {}
          return (
            <Col
              key={index}
              span={colConfig.span || colSpan}
              offset={colConfig.offset}
              order={colConfig.order}
              xs={colConfig.xs}
              sm={colConfig.sm}
              md={colConfig.md}
              lg={colConfig.lg}
              xl={colConfig.xl}
              xxl={colConfig.xxl}
            >
              {child}
            </Col>
          )
        })}
      </Row>
    )
  }

  return (
    <Row
      gutter={gap}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {childrenArray.map((child, index) => (
        <Col key={index} span={colSpan}>{child}</Col>
      ))}
    </Row>
  )
}

/**
 * GridRow 组件（可选，用于精细控制）
 * 实际使用中，Grid 已经包含 Row 功能
 */
export const GridRow: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({
  children,
  ...rest
}) => {
  return <Row {...rest}>{children}</Row>
}

/**
 * GridCol 组件（可选，用于精细控制）
 */
export const GridCol: React.FC<GridColConfig & { children?: React.ReactNode }> = ({
  children,
  span = 24,
  offset,
  order,
  push,
  pull,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  ...rest
}) => {
  return (
    <Col
      span={span}
      offset={offset}
      order={order}
      push={push}
      pull={pull}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      xxl={xxl}
      {...rest}
    >
      {children}
    </Col>
  )
}
