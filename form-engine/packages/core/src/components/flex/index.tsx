import React from 'react'
import type { FlexProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Flex 组件（默认实现）
 * Ant Design 风格 - 使用 CSS Flexbox 实现弹性布局
 */
export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap = 0,
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
    'evenly': 'space-evenly',
  }

  const alignMap: Record<string, string> = {
    'start': 'flex-start',
    'end': 'flex-end',
    'center': 'center',
    'stretch': 'stretch',
    'baseline': 'baseline',
  }

  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    justifyContent: justifyMap[justify] || justify,
    alignItems: alignMap[align] || align,
    flexWrap: wrap,
    gap: gap === 0 ? undefined : `${token('spacingSm')}`,
    ...propsStyle,
  }

  return (
    <div
      id={id}
      className={className}
      style={flexStyle}
      {...rest}
    >
      {children}
    </div>
  )
}
