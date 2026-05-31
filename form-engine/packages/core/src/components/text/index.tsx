import React from 'react'
import type { TextProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Text 组件（默认实现）
 * Ant Design 风格 - 用于显示纯文本或富文本
 */
export const Text: React.FC<TextProps> = ({
  content = '',
  fontSize = 14,
  color,
  fontWeight,
  lineHeight,
  textAlign = 'left',
  bold = false,
  italic = false,
  underline = false,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const { token } = useStyle()

  const textStyle: React.CSSProperties = {
    fontSize: fontSize === 14 ? token('fontSizeMd') as number : fontSize,
    color: color || token('textPrimary') as string,
    fontWeight: bold ? token('fontWeightBold') as number : fontWeight || token('fontWeightRegular') as number,
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    textAlign,
    lineHeight: lineHeight ? lineHeight : token('lineHeightMd') as number,
    ...propsStyle,
  }

  return (
    <span
      id={id}
      className={className}
      style={textStyle}
      dangerouslySetInnerHTML={{ __html: content }}
      {...rest}
    />
  )
}
