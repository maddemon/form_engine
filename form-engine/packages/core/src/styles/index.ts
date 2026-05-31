/**
 * Form Engine - Styles Module
 * 
 * 设计变量系统 - CSS Variables & Theme Tokens
 * 
 * ============================
 * 使用方式
 * ============================
 * 
 * 1. 自动注入（推荐）
 * ```tsx
 * import { StyleProvider, FormRender } from '@form-engine/core'
 * 
 * function App() {
 *   return (
 *     <StyleProvider theme={{ primary: '#722ed1' }} themeMode="light">
 *       <FormRender schema={schema} />
 *     </StyleProvider>
 *   )
 * }
 * ```
 * 
 * 2. 在组件中使用主题
 * ```tsx
 * import { useStyle, useTheme } from '@form-engine/core/styles'
 * 
 * function MyButton(props) {
 *   const { token, cssVar, mergeStyle } = useStyle()
 *   
 *   // 方式1：直接使用 Token 值
 *   const style = { background: token('primary') }
 *   
 *   // 方式2：使用 CSS 变量引用
 *   const style2 = { color: cssVar('primary') }
 *   
 *   return <button style={style}>{props.children}</button>
 * }
 * ```
 * 
 * 3. 用户覆盖变量（最简单）
 * 在项目的 CSS 文件中：
 * ```css
 * :root {
 *   --fe-primary: #722ed1;
 *   --fe-border-radius: 8px;
 * }
 * 
 * [data-fe-theme="dark"] {
 *   --fe-primary: #1d39c4;
 * }
 * ```
 */

// ============================
// Theme Tokens & Types
// ============================

export type { ThemeTokens, PartialThemeTokens } from './types'
export { defaultTheme, darkTheme, compactOverrides } from './defaultTheme'

// ============================
// Style Provider
// ============================

export {
  StyleProvider,
  useStyleContext,
  useTheme,
  useToken,
} from './StyleProvider'

export type { StyleProviderProps, ThemeMode, SizeMode, StyleContextValue } from './StyleProvider'

// ============================
// Hooks
// ============================

export {
  useStyle,
  useTokenValue,
  useCssVar,
} from './useStyle'

// ============================
// Style Utilities
// ============================

export {
  applyThemeStyles,
  createComponentStyle,
  createConditionalStyle,
  createButtonStyle,
  createInputStyle,
} from './applyStyles'

// ============================
// CSS Injection
// ============================

export {
  injectCssVariables,
  removeCssVariables,
  createStyleTag,
  injectIntoShadowDom,
  themeToCssVariables,
} from './injectCss'

// ============================
// CSS Variables File
// ============================

// 如需手动引入 CSS 文件（不推荐，推荐用 StyleProvider）：
// import '@form-engine/core/styles/tokens.css'
