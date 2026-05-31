/**
 * Form Engine - Styles Module Types
 */

import type { ThemeTokens } from './defaultTheme'

/**
 * 部分主题 Token（用于覆盖）
 */
export type PartialThemeTokens = Partial<ThemeTokens>

/**
 * CSS 变量映射
 */
export type CssVariables = Record<`--${string}`, string>

/**
 * 主题配置
 */
export interface ThemeConfig {
  /**
   * 主题 Token 覆盖
   */
  tokens?: PartialThemeTokens
  
  /**
   * CSS 前缀
   * @default 'fe'
   */
  prefix?: string
  
  /**
   * 是否注入 CSS 变量
   * @default true
   */
  injectCssVars?: boolean
}

/**
 * 组件样式工具函数返回类型
 */
export interface ComponentStyleUtils {
  /**
   * 获取 CSS 变量引用（返回 `var(--fe-xxx)` 字符串）
   */
  cssVar: (tokenName: keyof ThemeTokens) => string
  
  /**
   * 获取主题 Token 值
   */
  token: (tokenName: keyof ThemeTokens) => string | number
  
  /**
   * 合并样式（处理 CSS 变量）
   */
  mergeStyle: (
    defaultStyle: React.CSSProperties,
    ...overrides: Array<React.CSSProperties | undefined>
  ) => React.CSSProperties
}

/**
 * useStyleContext 返回值
 */
export interface UseStyleContextReturn extends ComponentStyleUtils {
  /**
   * 主题模式
   */
  themeMode: 'light' | 'dark'
  
  /**
   * 尺寸模式
   */
  sizeMode: 'default' | 'compact'
  
  /**
   * 完整主题对象
   */
  theme: ThemeTokens
}
