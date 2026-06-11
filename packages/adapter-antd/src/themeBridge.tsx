/**
 * Form Engine - Antd Theme Bridge
 *
 * 通过 antd v6 的 `theme.useToken()` 读取当前主题（包含暗色 algorithm 切换、
 * 自定义 colorPrimary 等），映射为 --fe-* CSS 变量注入到 DOM，
 * 使 Form Engine 的 UI（Designer、FieldRenderer 等）自动跟随 antd 主题。
 *
 * 注意：antd v6 使用 CSS-in-JS hash 渲染，**不在 :root 暴露 --ant-* CSS 变量**，
 * 因此不能用 getComputedStyle 读取。必须通过 antd 的 React API (useToken) 读取。
 *
 * 自动响应：
 * - ConfigProvider 切换 dark/light algorithm
 * - ConfigProvider 传入自定义 token（如 colorPrimary: '#722ed1'）
 * - ConfigProvider 切换紧凑/默认 size
 *
 * 使用方式：
 * ```tsx
 * import { ConfigProvider } from 'antd'
 * import { Designer } from '@form-engine/core'
 * import { antdAdapter } from '@form-engine/adapter-antd'
 *
 * function App() {
 *   return (
 *     <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
 *       <Designer desktopAdapter={antdAdapter} />
 *     </ConfigProvider>
 *   )
 * }
 * ```
 */

import type { BridgeProviderProps } from '@form-engine/core'
import { createStyleTag, transformTokenValue } from '@form-engine/core/styles'
import { theme as antdTheme } from 'antd'
import React, { useLayoutEffect, useMemo } from 'react'

/**
 * antd token -> fe token 映射
 * 部分 token（如 spacing、fontSize、borderRadius）antd 不直接提供，
 * 从 antd token 的派生 token 读取，缺失时用 defaultTheme 兜底
 */
function buildMapped(antd: ReturnType<typeof antdTheme.useToken>['token']): Record<string, string> {
  const t = antd as unknown as Record<string, unknown>

  // 颜色类 token
  const primary = String(t.colorPrimary ?? '#1677ff')
  const colorText = String(t.colorText ?? 'rgba(0,0,0,0.88)')
  const colorBgContainer = String(t.colorBgContainer ?? '#ffffff')
  console.log('colorBgContainer', colorBgContainer)
  const colorBgLayout = String(t.colorBgLayout ?? '#f5f5f5')
  const colorBgElevated = String(t.colorBgElevated ?? '#ffffff')
  const colorBorder = String(t.colorBorder ?? '#d9d9d9')
  const colorBorderSecondary = String(t.colorBorderSecondary ?? '#e8e8e8')
  console.log('colorBorderSecondary', colorBorderSecondary)
  const colorTextSecondary = String(t.colorTextSecondary ?? 'rgba(0,0,0,0.65)')
  const colorTextTertiary = String(t.colorTextTertiary ?? 'rgba(0,0,0,0.45)')
  const colorTextQuaternary = String(t.colorTextQuaternary ?? 'rgba(0,0,0,0.25)')

  // 通过 antd primary 派生 hover/active/bg/border
  const primaryHover = String(t.colorPrimaryHover ?? primary)
  const primaryActive = String(t.colorPrimaryActive ?? primary)
  const primaryBg = String(t.colorPrimaryBg ?? 'rgba(22, 119, 255, 0.06)')
  const primaryBorder = String(t.colorPrimaryBorder ?? 'rgba(22, 119, 255, 0.3)')
  const primaryBgHover = String(t.colorPrimaryBgHover ?? primaryBg)

  return {
    // Primary
    primary,
    primaryHover,
    primaryActive,
    primaryBg,
    primaryBorder,
    primaryHoverBg: primaryBgHover,

    // 文字
    textPrimary: colorText,
    textSecondary: colorTextSecondary,
    textTertiary: colorTextTertiary,
    textQuaternary: colorTextQuaternary,
    textPlaceholder: colorTextQuaternary,
    textMuted: colorTextQuaternary,

    // 背景
    bgPrimary: colorBgContainer,
    bgSecondary: colorBgLayout,
    bgTertiary: colorBgLayout,
    bgElevated: colorBgElevated,
    bgContainer: colorBgContainer,
    bgMask: String(t.colorBgMask ?? 'rgba(0,0,0,0.45)'),

    // 边框
    borderPrimary: colorBorder,
    borderSecondary: colorBorderSecondary,
    borderLight: colorBorderSecondary,

    // 尺寸（antd 不提供，使用 antd 自己的 spacing token，fallback 到合理值）
    spacingXs: '4px',
    spacingSm: '8px',
    spacingMd: '12px',
    spacingLg: '16px',
    spacingXl: '24px',
    spacing2xl: '32px',
    spacing3xl: '48px',

    // 字号（antd 不提供 fallback，使用 antd 自己的 fontSize token）
    fontSizeXs: String(t.fontSizeSM ?? '12px'),
    fontSizeSm: String(t.fontSizeSM ?? '13px'),
    fontSizeMd: String(t.fontSize ?? '14px'),
    fontSizeLg: String(t.fontSizeLG ?? '16px'),
    fontSizeXl: String(t.fontSizeXL ?? '20px'),
    fontSize2xl: String(t.fontSizeHeading2 ?? '24px'),
    fontSize3xl: String(t.fontSizeHeading1 ?? '32px'),

    // 圆角（antd 不提供，fallback 到 antd 派生）
    borderRadiusXs: String(t.borderRadiusXS ?? '2px'),
    borderRadiusSm: String(t.borderRadiusSM ?? '4px'),
    borderRadiusMd: String(t.borderRadius ?? '6px'),
    borderRadiusLg: String(t.borderRadiusLG ?? '8px'),
    borderRadiusXl: '12px',
  }
}

export const AntdBridgeProvider: React.FC<BridgeProviderProps> = ({ children, theme: themeOverrides }) => {
  // 通过 antd v6 的 useToken() 读取当前主题
  // - 自动响应 algorithm 切换（暗/亮）
  // - 自动响应 token 配置变化
  // - 必须在 ConfigProvider 内部使用
  // antd v6 的 useToken() 返回对象 { theme, token, hashId, cssVar }
  const { token: antdToken } = antdTheme.useToken()

  // 派生 mapped（无副作用）
  const mapped = useMemo(() => {
    const m = buildMapped(antdToken)
    for (const k of Object.keys(m)) {
      m[k] = transformTokenValue(k, m[k])
    }
    if (themeOverrides) {
      Object.assign(m, themeOverrides)
    }
    return m
  }, [antdToken, themeOverrides])

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    const styleEl = createStyleTag(mapped, 'fe')
    styleEl.setAttribute('data-fe-bridge', 'antd')

    return () => {
      const tag = document.querySelector('style[data-fe-theme="true"][data-fe-bridge="antd"]')
      if (tag) tag.remove()
    }
  }, [mapped, antdToken])

  return React.createElement(React.Fragment, null, children)
}
