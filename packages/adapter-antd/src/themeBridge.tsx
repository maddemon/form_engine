/**
 * Form Engine - Antd v6 Theme Bridge
 *
 * 读取 antd v6 的 --ant-* CSS 变量，映射为 --fe-* CSS 变量注入到 DOM，
 * 使 Form Engine 的 UI（Designer、FieldRenderer 等）自动跟随 antd 主题色。
 *
 * 使用方式：
 * ```tsx
 * import { ConfigProvider } from 'antd'
 * import { AntdBridgeProvider } from '@form-engine/adapter-antd'
 *
 * function App() {
 *   return (
 *     <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
 *       <AntdBridgeProvider>
 *         <FormRender schema={schema} />
 *       </AntdBridgeProvider>
 *     </ConfigProvider>
 *   )
 * }
 * ```
 */

import React, { useLayoutEffect } from 'react'
import { createStyleTag } from '@form-engine/core/styles'
import type { BridgeProviderProps } from '@form-engine/core'

const TOKEN_MAP: Record<string, string> = {
  // Primary
  primary: '--ant-color-primary',
  primaryHover: '--ant-color-primary-hover',
  primaryActive: '--ant-color-primary-active',
  primaryBg: '--ant-color-primary-bg',
  primaryBorder: '--ant-color-primary-border',
  primaryHoverBg: '--ant-color-primary-bg-hover',

  // Success
  success: '--ant-color-success',
  successHover: '--ant-color-success-hover',
  successActive: '--ant-color-success-active',
  successBg: '--ant-color-success-bg',

  // Warning
  warning: '--ant-color-warning',
  warningHover: '--ant-color-warning-hover',
  warningActive: '--ant-color-warning-active',
  warningBg: '--ant-color-warning-bg',

  // Error
  error: '--ant-color-error',
  errorHover: '--ant-color-error-hover',
  errorActive: '--ant-color-error-active',
  errorBg: '--ant-color-error-bg',

  // Text
  textPrimary: '--ant-color-text',
  textSecondary: '--ant-color-text-secondary',
  textTertiary: '--ant-color-text-tertiary',
  textQuaternary: '--ant-color-text-quaternary',
  textPlaceholder: '--ant-color-text-quaternary',
  textMuted: '--ant-color-text-quaternary',

  // Background
  bgPrimary: '--ant-color-bg-container',
  bgSecondary: '--ant-color-bg-layout',
  bgTertiary: '--ant-color-bg-container-secondary',
  bgElevated: '--ant-color-bg-elevated',
  bgContainer: '--ant-color-bg-container',
  bgMask: '--ant-color-bg-mask',

  // Border
  borderPrimary: '--ant-color-border',
  borderSecondary: '--ant-color-border-secondary',
  borderLight: '--ant-color-border-secondary',

  // Disabled
  disabledBg: '--ant-color-bg-container-disabled',
  disabledColor: '--ant-color-text-disabled',
  disabledBorder: '--ant-color-border-disabled',

  // Spacing
  spacingXs: '--ant-margin-xs',
  spacingSm: '--ant-margin-sm',
  spacingMd: '--ant-margin-md',
  spacingLg: '--ant-margin-lg',
  spacingXl: '--ant-margin-xl',
  spacing2xl: '--ant-margin-xxl',
  spacing3xl: '--ant-margin-xxxl',

  // Font
  fontSizeXs: '--ant-font-size-sm',
  fontSizeSm: '--ant-font-size-sm',
  fontSizeMd: '--ant-font-size',
  fontSizeLg: '--ant-font-size-lg',
  fontSizeXl: '--ant-font-size-xl',
  fontSize2xl: '--ant-font-size-2xl',
  fontSize3xl: '--ant-font-size-3xl',

  // Border radius
  borderRadiusXs: '--ant-border-radius-xs',
  borderRadiusSm: '--ant-border-radius-sm',
  borderRadiusMd: '--ant-border-radius-md',
  borderRadiusLg: '--ant-border-radius-lg',
  borderRadiusXl: '--ant-border-radius-xl',
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

export const AntdBridgeProvider: React.FC<BridgeProviderProps> = ({ children, theme: themeOverrides }) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    const rootStyle = getComputedStyle(document.documentElement)
    const mapped: Record<string, string> = {}

    for (const [feKey, cssVarName] of Object.entries(TOKEN_MAP)) {
      const rawValue = rootStyle.getPropertyValue(cssVarName).trim()
      if (rawValue) {
        mapped[feKey] = transformValue(feKey, cssVarName, rawValue)
      }
    }

    if (themeOverrides) {
      Object.assign(mapped, themeOverrides)
    }

    const styleEl = createStyleTag(mapped, 'fe')
    styleEl.setAttribute('data-fe-bridge', 'antd')

    if (Object.keys(mapped).length === 0) {
      console.warn(
        '[form-engine] AntdBridgeProvider 检测到无可映射的 --ant-* CSS 变量，' +
        '请确认外层存在 antd 的 <ConfigProvider>。'
      )
    }

    return () => {
      const tag = document.querySelector('style[data-fe-theme="true"][data-fe-bridge="antd"]')
      if (tag) tag.remove()
    }
  }, [themeOverrides])

  return React.createElement(React.Fragment, null, children)
}