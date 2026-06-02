/**
 * Form Engine - Theme Bridge 接口定义
 *
 * Theme Bridge 负责将开发者 UI 库（antd / antd-mobile）的主题 Token
 * 映射为 Form Engine 的 --fe-* CSS 变量，使 Designer/FormRender 等 UI
 * 自动跟随宿主项目的主题色。
 *
 * 使用方式详见 theme-bridge-design.md
 */

import type React from 'react'
import type { PartialThemeTokens } from './types'

/**
 * CSS 变量映射配置
 * key: FE token 名（驼峰，如 primary、borderLight）
 * value: 源 CSS 变量名（如 --ant-color-primary、--adm-color-primary）
 */
export type CssVarMapping = Record<string, string>

/**
 * ThemeBridge 配置
 */
export interface ThemeBridgeConfig {
  /** 来源 UI 库（用于将来扩展 / 调试） */
  source: 'antd' | 'antd-mobile' | 'mui' | 'custom'
  /** CSS 变量映射表 */
  mapping: CssVarMapping
  /**
   * 值转换器：key → 源变量名 → 原始值 → 转换后值
   * 典型用途：antd v6 的 borderRadius/fontSize 等是裸数字（无单位），需补 'px'
   */
  transformValue?: (feKey: string, srcCssVar: string, rawValue: string) => string
}

/**
 * BridgeProvider 的 Props
 *
 * 命名上 `theme` 与 `StyleProvider.theme` 对齐，避免「overrides」与「theme」混用。
 */
export interface BridgeProviderProps {
  children: React.ReactNode
  /** 用户最终覆盖的 token（在 bridge 映射之上） */
  theme?: PartialThemeTokens
}