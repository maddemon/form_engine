import React from 'react'
import type { ContainerProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Container 组件（默认实现）
 * Ant Design 风格 - 通用容器组件
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 0,
  margin = 0,
  background,
  borderRadius = 0,
  border,
  minHeight,
  layout = 'vertical',
  justify = 'start',
  align = 'stretch',
  wrap = false,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const { token } = useStyle()

  // 将 justify 值映射到 flexbox
  const justifyMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'between': 'space-between',
    'around': 'space-around',
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    justifyContent: justifyMap[justify] || 'flex-start',
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    padding: padding === 0 ? undefined : `${token('spacingSm')} ${token('spacingMd')}`,
    margin: margin === 0 ? undefined : `${token('spacingSm')}`,
    background: background || token('bgPrimary') as string,
    borderRadius: borderRadius === 0 ? undefined : token('borderRadiusMd') as string,
    border: border || `1px solid ${token('borderTertiary') as string}`,
    minHeight: minHeight ? `${minHeight}px` : undefined,
    boxSizing: 'border-box',
    ...propsStyle,
  }

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...rest}
    >
      {children}
    </div>
  )
}
