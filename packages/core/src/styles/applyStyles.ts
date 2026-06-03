/**
 * Form Engine - Style Application Utilities
 *
 * 提供将主题 Token 应用到组件样式的工具函数
 * 支持 CSS 变量和直接值两种方式
 */

import type { ThemeTokens } from './defaultTheme'
import { toKebabCase } from './utils'

/**
 * 样式应用模式
 * - 'css-var': 使用 CSS 变量引用 (var(--fe-xxx))
 * - 'direct': 直接使用 Token 值 (#1677ff)
 */
export type StyleMode = 'css-var' | 'direct'

/**
 * 将主题 Token 映射到 style 对象
 *
 * @param theme - 主题 Token 对象
 * @param mapping - Token 到 CSS 属性的映射
 * @param mode - 应用模式
 * @returns React.CSSProperties 对象
 *
 * @example
 * ```typescript
 * const theme = useTheme()
 *
 * const style = applyThemeStyles(theme, {
 *   color: 'primary',
 *   backgroundColor: 'bgPrimary',
 *   borderRadius: 'borderRadiusSm',
 *   padding: 'spacingMd',
 * })
 * // 返回: { color: '#1677ff', backgroundColor: '#ffffff', ... }
 * ```
 */
export function applyThemeStyles(theme: ThemeTokens, mapping: Partial<Record<keyof React.CSSProperties, keyof ThemeTokens>>, mode: StyleMode = 'direct'): React.CSSProperties {
  const style: React.CSSProperties = {}

  for (const [cssProp, tokenName] of Object.entries(mapping)) {
    if (tokenName) {
      if (mode === 'css-var') {
        // 使用 CSS 变量引用
        ;(style as any)[cssProp] = `var(--fe-${toKebabCase(String(tokenName))})`
      } else {
        // 直接使用值
        ;(style as any)[cssProp] = theme[tokenName]
      }
    }
  }

  return style
}

/**
 * 创建组件基础样式
 * 自动处理 props.style 和 props.className 的合并
 *
 * @param baseStyle - 组件基础样式
 * @param propsStyle - 用户传入的 style prop
 * @param propsClassName - 用户传入的 className prop
 * @returns 合并后的样式对象和 className
 *
 * @example
 * ```tsx
 * function Button(props) {
 *   const baseStyle = { padding: '8px 16px', ... }
 *   const { style, className } = createComponentStyle(baseStyle, props.style, props.className)
 *
 *   return <button style={style} className={className} />
 * }
 * ```
 */
export function createComponentStyle(baseStyle: React.CSSProperties, propsStyle?: React.CSSProperties, propsClassName?: string): { style: React.CSSProperties; className?: string } {
  return {
    style: { ...baseStyle, ...propsStyle },
    className: propsClassName,
  }
}

/**
 * 根据状态返回条件样式
 *
 * @param conditions - 条件样式映射
 * @returns 合并后的样式对象
 *
 * @example
 * ```typescript
 * const style = createConditionalStyle({
 *   [isHovered]: { background: '#4096ff' },
 *   [isDisabled]: { opacity: 0.5, cursor: 'not-allowed' },
 *   [isPrimary]: { background: '#1677ff', color: '#fff' },
 * })
 * ```
 */
export function createConditionalStyle(conditions: Record<string, React.CSSProperties>): React.CSSProperties {
  let merged: React.CSSProperties = {}

  for (const [condition, style] of Object.entries(conditions)) {
    if (condition === 'true') {
      merged = { ...merged, ...style }
    }
  }

  return merged
}

/**
 * 创建按钮样式（常用模式提取）
 */
export function createButtonStyle(
  theme: ThemeTokens,
  options: {
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text'
    danger?: boolean
    disabled?: boolean
    loading?: boolean
    size?: 'small' | 'middle' | 'large'
  },
): React.CSSProperties {
  const { type = 'default', danger = false, disabled = false, size = 'middle' } = options

  const baseStyle: React.CSSProperties = {
    padding: size === 'small' ? theme.spacingSm : size === 'large' ? theme.spacingLg : theme.spacingMd,
    borderRadius: theme.borderRadiusSm,
    fontSize: theme.fontSizeMd,
    fontWeight: theme.fontWeightRegular,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.borderPrimary,
  }

  if (danger) {
    return {
      ...baseStyle,
      background: type === 'primary' ? theme.error : theme.bgPrimary,
      borderColor: theme.error,
      color: type === 'primary' ? theme.bgPrimary : theme.error,
    }
  }

  switch (type) {
    case 'primary':
      return { ...baseStyle, background: theme.primary, borderColor: theme.primary, color: theme.bgPrimary }
    case 'dashed':
      return { ...baseStyle, background: theme.bgPrimary, borderColor: theme.borderPrimary, borderStyle: 'dashed' as any }
    case 'link':
      return { ...baseStyle, background: 'transparent', borderColor: 'transparent', color: theme.primary }
    case 'text':
      return { ...baseStyle, background: 'transparent', borderColor: 'transparent' }
    default:
      return { ...baseStyle, background: theme.bgPrimary, borderColor: theme.borderPrimary, color: theme.textPrimary }
  }
}

/**
 * 创建输入框样式（常用模式提取）
 */
export function createInputStyle(
  theme: ThemeTokens,
  options: {
    disabled?: boolean
    readOnly?: boolean
    hasError?: boolean
  } = {},
): React.CSSProperties {
  const { disabled = false, readOnly = false, hasError = false } = options

  return {
    width: '100%',
    padding: theme.inputPadding,
    background: disabled ? theme.disabledBg : theme.inputBg,
    border: theme.inputBorder,
    borderRadius: theme.inputBorderRadius,
    color: theme.textPrimary,
    fontSize: theme.fontSizeMd,
    cursor: disabled ? 'not-allowed' : readOnly ? 'default' : 'text',
    opacity: disabled ? 0.5 : 1,
    transition: theme.transitionAll,
    outline: 'none',
  }
}

// ============================
// Helper Functions
// ============================
