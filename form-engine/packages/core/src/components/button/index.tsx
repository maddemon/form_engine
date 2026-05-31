import React from 'react'
import type { ButtonProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Button 组件（默认实现）
 *
 * 使用主题 Token，支持通过 CSS 变量或 StyleProvider 自定义样式
 *
 * @example
 * // 方式1：通过 CSS 变量覆盖（在项目 CSS 中）
 * // :root { --fe-primary: #722ed1; }
 *
 * // 方式2：通过 StyleProvider
 * // <StyleProvider theme={{ primary: '#722ed1' }}>
 *
 * // 方式3：通过 props.style 或 props.className 覆盖
 * // <Button style={{ height: 40 }}>按钮</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'default',
  htmlType = 'button',
  disabled,
  loading,
  danger,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      onClick?.(e)
    }
  }

  // 使用主题 Token
  const { token, mergeStyle } = useStyle()

  // 基础样式 - 使用主题 Token
  const baseStyle: React.CSSProperties = {
    padding: `${token('spacingSm')} ${token('spacingMd')}`,
    borderRadius: token('borderRadiusSm') as string,
    border: `1px solid ${token('borderPrimary')}`,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    fontSize: token('fontSizeMd') as number,
    fontWeight: token('fontWeightRegular') as number,
    transition: String(token('transitionAll')),
    background: token('bgPrimary') as string,
    color: token('textPrimary') as string,
  }

  // 根据 type 和 danger 返回对应样式
  let finalStyle: React.CSSProperties

  if (danger) {
    finalStyle = {
      ...baseStyle,
      background: type === 'primary' ? token('error') as string : token('bgPrimary') as string,
      borderColor: token('error') as string,
      color: type === 'primary' ? token('bgPrimary') as string : token('error') as string,
    }
  } else {
    switch (type) {
      case 'primary':
        finalStyle = {
          ...baseStyle,
          background: token('primary') as string,
          borderColor: token('primary') as string,
          color: token('bgPrimary') as string,
        }
        break
      case 'dashed':
        finalStyle = {
          ...baseStyle,
          borderStyle: 'dashed' as any,
        }
        break
      case 'link':
        finalStyle = {
          ...baseStyle,
          border: 'none',
          background: 'transparent',
          color: token('primary') as string,
        }
        break
      case 'text':
        finalStyle = {
          ...baseStyle,
          border: 'none',
          background: 'transparent',
        }
        break
      default:
        finalStyle = {
          ...baseStyle,
          background: token('bgPrimary') as string,
        }
        break
    }
  }

  // 合并用户传入的 style（支持覆盖）
  const mergedStyle = mergeStyle(finalStyle, propsStyle)

  return (
    <button
      type={htmlType}
      onClick={handleClick}
      disabled={disabled || loading}
      id={id}
      className={className}
      style={mergedStyle}
      {...rest}
    >
      {loading && <span style={{ marginRight: token('spacingSm') as number }}>⏳</span>}
      {children}
    </button>
  )
}
