/**
 * Form Engine - useStyle Hook
 * 
 * 在组件中使用主题 Token 和 CSS 变量
 * 
 * 使用方式：
 * ```tsx
 * import { useStyle } from '@form-engine/core/styles'
 * 
 * function MyComponent() {
 *   const { cssVar, token, mergeStyle } = useStyle()
 *   
 *   // 方式1：在 inline style 中使用 token 值
 *   const style = {
 *     color: token('primary'),
 *     padding: token('spacingMd'),
 *   }
 *   
 *   // 方式2：使用 CSS 变量引用（需要 CSS 变量已注入）
 *   const styleWithVars = {
 *     color: cssVar('primary'),
 *     // 输出: 'var(--fe-primary)'
 *   }
 *   
 *   // 方式3：合并样式
 *   const finalStyle = mergeStyle(baseStyle, props.style)
 * }
 * ```
 */

import { useMemo } from 'react'
import type { ThemeTokens } from '../styles/defaultTheme'
import { useStyleContext, useTheme, useToken } from './StyleProvider'
import type { ComponentStyleUtils } from './types'

/**
 * 在组件中使用主题样式的 Hook
 * 
 * @returns 包含 cssVar、token、mergeStyle 等工具函数的对象
 * 
 * @example
 * ```tsx
 * function Button(props) {
 *   const { token, cssVar, mergeStyle } = useStyle()
 *   
 *   const style = mergeStyle({
 *     background: token('primary'),
 *     borderRadius: token('borderRadiusSm'),
 *   }, props.style)
 *   
 *   return <button style={style}>{props.children}</button>
 * }
 * ```
 */
export function useStyle(): ComponentStyleUtils & { theme: ThemeTokens } {
  const context = useStyleContext()
  
  return useMemo(() => {
    const cssVar = (tokenName: keyof ThemeTokens): string => {
      return context.getCssVar(tokenName)
    }
    
    const token = (tokenName: keyof ThemeTokens): string | number => {
      return context.getToken(tokenName)
    }
    
    const mergeStyle = (
      defaultStyle: React.CSSProperties,
      ...overrides: Array<React.CSSProperties | undefined>
    ): React.CSSProperties => {
      return Object.assign({}, defaultStyle, ...overrides.filter(Boolean))
    }
    
    return {
      cssVar,
      token,
      mergeStyle,
      theme: context.theme,
    }
  }, [context])
}

/**
 * 简化的 useStyle Hook - 仅获取 token 值
 * 
 * @example
 * ```tsx
 * function Button(props) {
 *   const token = useTokenValue()
 *   
 *   return (
 *     <button style={{ background: token.primary }}>
 *       {props.children}
 *     </button>
 *   )
 * }
 * ```
 */
export function useTokenValue(): ThemeTokens {
  return useTheme()
}

/**
 * 获取单个 CSS 变量引用的 Hook
 * 
 * @param tokenName - Token 名称
 * @returns `var(--fe-xxx)` 字符串
 * 
 * @example
 * ```tsx
 * function Button() {
 *   const primaryVar = useCssVar('primary')
 *   // primaryVar = 'var(--fe-primary)'
 *   
 *   return <button style={{ color: primaryVar }}>按钮</button>
 * }
 * ```
 */
export function useCssVar<K extends keyof ThemeTokens>(tokenName: K): string {
  const context = useStyleContext()
  return context.getCssVar(tokenName)
}

/**
 * 获取单个 Token 值的 Hook
 * 
 * @param tokenName - Token 名称
 * @returns Token 值
 * 
 * @example
 * ```tsx
 * function Button() {
 *   const primaryColor = useToken('primary')
 *   // primaryColor = '#1677ff'
 *   
 *   return <button style={{ color: primaryColor }}>按钮</button>
 * }
 * ```
 */
export function useTokenValue_<K extends keyof ThemeTokens>(tokenName: K): ThemeTokens[K] {
  return useToken(tokenName)
}

// 重新导出方便使用
export { useStyleContext, useTheme, useToken } from './StyleProvider'
