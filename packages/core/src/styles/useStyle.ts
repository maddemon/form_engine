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
import { defaultTheme } from '../styles/defaultTheme'
import { useHasStyleProvider, useStyleContext, useTheme, useToken } from './StyleProvider'
import { injectCssVariables } from './injectCss'
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
  // 同步兜底：未包裹 StyleProvider 时立即注入默认主题到 <html>。
  // 必须同步执行，否则首次 render 时 var(--fe-*) 引用全部失效。
  // 模块级 Set 缓存保证不会重复写入，重复调用成本极低。
  useEnsureDefaultTheme(context.prefix)

  return useMemo(() => {
    const cssVar = (tokenName: keyof ThemeTokens): string => {
      return context.getCssVar(tokenName)
    }

    const token = <K extends keyof ThemeTokens>(tokenName: K): ThemeTokens[K] => {
      return context.getToken(tokenName) as ThemeTokens[K]
    }

    const mergeStyle = (defaultStyle: React.CSSProperties, ...overrides: Array<React.CSSProperties | undefined>): React.CSSProperties => {
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

// ============================
// Fallback 默认主题注入
// ============================

/**
 * 模块级缓存：记录已通过 fallback 注入的 CSS 变量前缀。
 * 避免多个组件 mount 时重复执行注入。
 */
const _injectedPrefixes = new Set<string>()

/**
 * 兜底注入默认主题 CSS 变量。
 *
 * 当用户没有用 `<StyleProvider>` 包裹组件树时调用本函数，
 * 会把 defaultTheme 转换成 `--fe-xxx` CSS 变量并写入 `<html>`。
 *
 * 已注入过相同前缀的 prefix 会被跳过，幂等。
 */
export function ensureDefaultThemeInjected(prefix: string = 'fe'): void {
  if (_injectedPrefixes.has(prefix)) return
  injectCssVariables(defaultTheme, prefix)
  _injectedPrefixes.add(prefix)
}

/**
 * 在组件中使用：当未包裹 StyleProvider 时自动注入默认主题。
 *
 * 设计动机：让 `<Designer>` / `<FormRender>` 等顶层组件在用户没显式
 * 包裹 `<StyleProvider>` 时仍能开箱即用，避免 `var(--fe-*)` 全部失效。
 *
 * 行为：
 * - 若已包裹 StyleProvider，本 Hook 不执行任何操作（用户主题优先）
 * - 若未包裹，本函数**同步**地将默认主题注入到 `<html>`，确保首次渲染
 *   时 `var(--fe-*)` 已可用，不会出现"首次渲染无样式"的闪烁
 * - 幂等：已注入过相同 prefix 时不会重复执行
 *
 * 注意：必须同步执行（不能用 useEffect），否则首次 render 拿不到变量。
 *
 * @example
 * ```tsx
 * function Designer() {
 *   useEnsureDefaultTheme()  // 用户没包 StyleProvider 也能用
 *   // ...
 * }
 * ```
 */
export function useEnsureDefaultTheme(prefix: string = 'fe'): void {
  const hasProvider = useHasStyleProvider()
  if (!hasProvider) {
    ensureDefaultThemeInjected(prefix)
  }
}

// 重新导出方便使用
export { useHasStyleProvider, useStyleContext, useTheme, useToken } from './StyleProvider'

