/**
 * Form Engine - CSS Variables Injection Utility
 *
 * 将 JS 主题 Token 注入为 CSS 变量
 * 支持动态更新
 */

import type { ThemeTokens } from './types'
import { toKebabCase } from './utils'

/**
 * 将主题 Token 对象转换为 CSS 变量对象
 * { primaryColor: '#1677ff' } -> { '--fe-primary-color': '#1677ff' }
 */
export function themeToCssVariables(theme: Partial<ThemeTokens>, prefix: string = 'fe'): Record<string, string> {
  const cssVars: Record<string, string> = {}

  for (const [key, value] of Object.entries(theme)) {
    if (value !== undefined) {
      const cssVarName = `--${prefix}-${toKebabCase(key)}`
      cssVars[cssVarName] = String(value)
    }
  }

  return cssVars
}

/**
 * 将 CSS 变量注入到指定元素
 */
export function injectCssVariables(theme: Partial<ThemeTokens>, prefix: string = 'fe', target: HTMLElement = document.documentElement): void {
  const cssVars = themeToCssVariables(theme, prefix)

  for (const [key, value] of Object.entries(cssVars)) {
    target.style.setProperty(key, value)
  }
}

/**
 * 移除指定前缀的 CSS 变量
 */
export function removeCssVariables(prefix: string = 'fe', target: HTMLElement = document.documentElement): void {
  const styles = target.style
  const toRemove: string[] = []

  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i]
    if (prop.startsWith(`--${prefix}-`)) {
      toRemove.push(prop)
    }
  }

  for (const prop of toRemove) {
    styles.removeProperty(prop)
  }
}

/**
 * 创建 <style> 标签并注入 CSS 变量
 * 适用于需要兼容 SSR 或 Shadow DOM 的场景
 *
 * @param tokens - Token 键值对（key 为驼峰命名，如 primary、borderLight）
 * @param prefix - CSS 变量前缀（默认 'fe'）
 * @param target - 目标元素（默认 document.head）
 */
export function createStyleTag(tokens: Record<string, string>, prefix: string = 'fe', target: HTMLElement = document.head): HTMLStyleElement {
  // 生成 CSS 文本：{ primary: '#1677ff' } → :root { --fe-primary: #1677ff; }
  const cssText = `:root {\n${Object.entries(tokens)
    .map(([key, value]) => `  --${prefix}-${toKebabCase(key)}: ${value};`)
    .join('\n')}\n}`

  // 创建 style 标签
  const style = document.createElement('style')
  style.setAttribute('data-fe-theme', 'true')
  style.textContent = cssText

  // 移除旧的
  const oldStyle = target.querySelector('style[data-fe-theme="true"]')
  if (oldStyle) {
    oldStyle.remove()
  }

  target.appendChild(style)
  return style
}

/**
 * 在 Shadow DOM 中注入 CSS 变量
 */
export function injectIntoShadowDom(theme: Partial<ThemeTokens>, shadowRoot: ShadowRoot, prefix: string = 'fe'): void {
  const cssVars = themeToCssVariables(theme, prefix)

  // 在 Shadow DOM 的 host 上设置变量
  const host = shadowRoot.host as HTMLElement
  for (const [key, value] of Object.entries(cssVars)) {
    host.style.setProperty(key, value)
  }
}
