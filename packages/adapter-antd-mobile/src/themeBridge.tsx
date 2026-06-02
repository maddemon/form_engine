/**
 * Form Engine - Antd Mobile Theme Bridge
 *
 * 读取 antd-mobile v5 的 --adm-* CSS 变量，映射为 --fe-* CSS 变量注入到 DOM。
 *
 * antd-mobile 的 CSS 变量在组件挂载后才写入 DOM，因此使用 useLayoutEffect
 * 确保在 DOM 就绪后读取。
 *
 * 使用方式：
 * ```tsx
 * import { AntdMobileBridgeProvider } from '@form-engine/adapter-antd-mobile'
 *
 * function App() {
 *   return (
 *     <AntdMobileBridgeProvider>
 *       <FormRender schema={schema} />
 *     </AntdMobileBridgeProvider>
 *   )
 * }
 * ```
 */

import React, { useLayoutEffect } from 'react'
import { createStyleTag } from '@form-engine/core/styles'
import type { BridgeProviderProps } from '@form-engine/core'

const CSS_VAR_MAP: Record<string, string> = {
  primary: '--adm-color-primary',
  primaryHover: '--adm-color-primary',
  primaryActive: '--adm-color-primary',
  primaryBg: '--adm-color-primary-light',
  primaryBorder: '--adm-color-primary-light',
  primaryHoverBg: '--adm-color-primary-light',

  success: '--adm-color-success',
  successBg: '--adm-color-success-light',

  warning: '--adm-color-warning',
  warningBg: '--adm-color-warning-light',

  error: '--adm-color-danger',
  errorHover: '--adm-color-danger',
  errorActive: '--adm-color-danger',
  errorBg: '--adm-color-danger-light',

  textPrimary: '--adm-color-text',
  textSecondary: '--adm-color-weak',
  textTertiary: '--adm-color-weak',
  textMuted: '--adm-color-light',

  bgPrimary: '--adm-color-background',
  bgSecondary: '--adm-color-box',
  bgTertiary: '--adm-color-background',

  borderPrimary: '--adm-color-border',
  borderLight: '--adm-color-border',

  disabledBg: '--adm-color-background',
  disabledColor: '--adm-color-light',
  disabledBorder: '--adm-color-border',
}

function transformValue(feKey: string, _srcCssVar: string, rawValue: string): string {
  if (!rawValue) return rawValue

  const pxKeys = new Set([
    'borderRadiusXs', 'borderRadiusSm', 'borderRadiusMd', 'borderRadiusLg', 'borderRadiusXl',
    'spacingXs', 'spacingSm', 'spacingMd', 'spacingLg', 'spacingXl', 'spacing2xl', 'spacing3xl',
    'fontSizeXs', 'fontSizeSm', 'fontSizeMd', 'fontSizeLg', 'fontSizeXl', 'fontSize2xl', 'fontSize3xl',
  ])

  if (pxKeys.has(feKey) && !isNaN(Number(rawValue)) && !rawValue.includes('px')) {
    return `${rawValue}px`
  }

  return rawValue
}

export const AntdMobileBridgeProvider: React.FC<BridgeProviderProps> = ({ children, theme: themeOverrides }) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    const rootStyle = getComputedStyle(document.documentElement)
    const mapped: Record<string, string> = {}

    for (const [feKey, cssVarName] of Object.entries(CSS_VAR_MAP)) {
      const value = rootStyle.getPropertyValue(cssVarName).trim()
      if (value) {
        mapped[feKey] = transformValue(feKey, cssVarName, value)
      }
    }

    if (themeOverrides) {
      Object.assign(mapped, themeOverrides)
    }

    const styleEl = createStyleTag(mapped, 'fe')
    styleEl.setAttribute('data-fe-bridge', 'antd-mobile')

    return () => {
      const tag = document.querySelector('style[data-fe-theme="true"][data-fe-bridge="antd-mobile"]')
      if (tag) tag.remove()
    }
  }, [themeOverrides])

  return React.createElement(React.Fragment, null, children)
}