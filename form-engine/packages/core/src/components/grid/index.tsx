import React from 'react'
import type { GridProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Grid 组件（默认实现）
 * Ant Design 风格 - 使用 CSS Grid 实现栅格布局
 */
export const Grid: React.FC<GridProps> = ({
  children,
  columns = 1,
  rows,
  gap = 0,
  columnGap,
  rowGap,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const { token } = useStyle()

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : undefined,
    gap: gap === 0 ? undefined : `${token('spacingSm')}`,
    columnGap: columnGap ? `${token('spacingXs')}` : undefined,
    rowGap: rowGap ? `${token('spacingXs')}` : undefined,
    ...propsStyle,
  }

  return (
    <div
      id={id}
      className={className}
      style={gridStyle}
      {...rest}
    >
      {children}
    </div>
  )
}
