import React from 'react'
import type { DividerProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Divider 组件（默认实现）
 * Ant Design 风格
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'center',
  orientationMargin = '8px',
  dashed = false,
  style: propsStyle,
  className,
  id,
  children,
  ...rest
}) => {
  const { token } = useStyle()

  // 如果没有 children，显示纯分割线
  if (!children) {
    return (
      <hr
        id={id}
        className={className}
        style={{
          border: 'none',
          borderTop: `1px ${dashed ? 'dashed' : 'solid'} ${token('borderPrimary')}`,
          margin: `${token('spacingLg')} 0`,
          ...propsStyle,
        }}
        {...rest}
      />
    )
  }

  // 如果有 children，显示带文字的分割线
  const textStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: `0 ${token('spacingMd')}`,
    fontSize: token('fontSizeMd') as number,
    color: token('textPrimary') as string,
    whiteSpace: 'nowrap',
  }

  const lineStyle: React.CSSProperties = {
    flex: 1,
    borderTop: `1px ${dashed ? 'dashed' : 'solid'} ${token('borderPrimary')}`,
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    margin: `${token('spacingLg')} 0`,
    ...propsStyle,
  }

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...rest}
    >
      {orientation !== 'right' && (
        <span style={{ ...lineStyle, ...(orientation === 'left' ? { flex: 'none', marginRight: orientationMargin } : { marginRight: 0 }) }} />
      )}

      <span style={textStyle}>{children}</span>

      <span style={{ ...lineStyle, ...(orientation === 'left' ? { flex: 1 } : { marginLeft: 0 }) }} />
    </div>
  )
}
