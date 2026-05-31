/**
 * Form Engine - Style Provider
 *
 * 提供运行时主题定制能力
 *
 * 使用方式：
 * ```tsx
 * import { StyleProvider, FormRender } from '@form-engine/core'
 *
 * // 方式1：使用 StyleProvider 包裹
 * function App() {
 *   return (
 *     <StyleProvider theme={{ primary: '#722ed1' }}>
 *       <FormRender schema={schema} />
 *     </StyleProvider>
 *   )
 * }
 *
 * // 方式2：暗黑模式
 * function App() {
 *   return (
 *     <StyleProvider themeMode="dark">
 *       <FormRender schema={schema} />
 *     </StyleProvider>
 *   )
 * }
 *
 * // 方式3：紧凑模式
 * function App() {
 *   return (
 *     <StyleProvider sizeMode="compact">
 *       <FormRender schema={schema} />
 *     </StyleProvider>
 *   )
 * }
 * ```
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import type { ThemeTokens, PartialThemeTokens } from './types'
import { defaultTheme, darkTheme, compactOverrides } from './defaultTheme'
import { injectCssVariables } from './injectCss'

// ============================
// Types
// ============================

export type ThemeMode = 'light' | 'dark'
export type SizeMode = 'default' | 'compact'

export interface StyleProviderProps {
  /**
   * 主题覆盖 - 部分 Token 覆盖
   */
  theme?: PartialThemeTokens
  
  /**
   * 主题模式 - light/dark
   * @default 'light'
   */
  themeMode?: ThemeMode
  
  /**
   * 尺寸模式 - default/compact
   * @default 'default'
   */
  sizeMode?: SizeMode
  
  /**
   * 自定义 CSS 前缀
   * @default 'fe'
   */
  prefix?: string
  
  /**
   * 是否自动注入 CSS 变量到 <head>
   * @default true
   */
  autoInject?: boolean
  
  /**
   * 子组件
   */
  children: React.ReactNode
}

// ============================
// Context
// ============================

export interface StyleContextValue {
  /** 合并后的主题 Token */
  theme: ThemeTokens
  /** 主题模式 */
  themeMode: ThemeMode
  /** 尺寸模式 */
  sizeMode: SizeMode
  /** CSS 前缀 */
  prefix: string
  /** 获取 CSS 变量名 */
  getCssVar: (tokenName: keyof ThemeTokens) => string
  /** 获取主题 Token 值 */
  getToken: (tokenName: keyof ThemeTokens) => string | number
}

const StyleContext = createContext<StyleContextValue | null>(null)

// ============================
// Provider Component
// ============================

export const StyleProvider: React.FC<StyleProviderProps> = ({
  theme: themeOverrides,
  themeMode = 'light',
  sizeMode = 'default',
  prefix = 'fe',
  autoInject = true,
  children,
}) => {
  // 合并主题
  const mergedTheme = useMemo(() => {
    let base = { ...defaultTheme }
    
    // 应用暗黑模式
    if (themeMode === 'dark') {
      base = { ...base, ...darkTheme }
    }
    
    // 应用紧凑模式
    if (sizeMode === 'compact') {
      base = { ...base, ...compactOverrides }
    }
    
    // 应用用户自定义覆盖
    if (themeOverrides) {
      base = { ...base, ...themeOverrides }
    }
    
    return base
  }, [themeMode, sizeMode, themeOverrides])

  // 注入 CSS 变量
  useEffect(() => {
    if (!autoInject) return
    
    // 注入 CSS 变量到 :root
    injectCssVariables(mergedTheme, prefix)
    
    // 设置 data 属性
    document.documentElement.setAttribute('data-fe-theme', themeMode)
    document.documentElement.setAttribute('data-fe-size', sizeMode)
    
    return () => {
      // 清理（可选）
      // removeCssVariables(prefix)
    }
  }, [mergedTheme, themeMode, sizeMode, prefix, autoInject])

  // Context 值
  const contextValue = useMemo<StyleContextValue>(() => ({
    theme: mergedTheme,
    themeMode,
    sizeMode,
    prefix,
    getCssVar: (tokenName) => `var(--${prefix}-${toKebabCase(tokenName)})`,
    getToken: (tokenName) => mergedTheme[tokenName],
  }), [mergedTheme, themeMode, sizeMode, prefix])

  return (
    <StyleContext.Provider value={contextValue}>
      {children}
    </StyleContext.Provider>
  )
}

// ============================
// Hook
// ============================

/**
 * 获取当前主题上下文
 */
export function useStyleContext(): StyleContextValue {
  const context = useContext(StyleContext)
  if (!context) {
    // 如果没有 Provider，返回默认值
    return createDefaultContext()
  }
  return context
}

/**
 * 获取主题 Token（带默认值回退）
 */
export function useTheme(): ThemeTokens {
  const context = useContext(StyleContext)
  return context?.theme ?? defaultTheme
}

/**
 * 获取单个主题 Token 值
 */
export function useToken<K extends keyof ThemeTokens>(tokenName: K): ThemeTokens[K] {
  const theme = useTheme()
  return theme[tokenName]
}

// ============================
// Helper Functions
// ============================

function createDefaultContext(): StyleContextValue {
  return {
    theme: defaultTheme,
    themeMode: 'light',
    sizeMode: 'default',
    prefix: 'fe',
    getCssVar: (tokenName) => `var(--fe-${toKebabCase(tokenName)})`,
    getToken: (tokenName) => defaultTheme[tokenName],
  }
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

