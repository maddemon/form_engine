/**
 * Form Engine - Default Theme Tokens (JS Object)
 * 
 * 这些 Token 与 tokens.css 中的 CSS 变量一一对应
 * 用于在 inline styles 中引用，支持运行时动态修改
 */

export interface ThemeTokens {
  // Primary
  primary: string
  primaryHover: string
  primaryActive: string
  primaryBg: string
  primaryBorder: string

  // Success
  success: string
  successHover: string
  successActive: string
  successBg: string

  // Warning
  warning: string
  warningHover: string
  warningActive: string
  warningBg: string

  // Error
  error: string
  errorHover: string
  errorActive: string
  errorBg: string

  // Text
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textQuaternary: string
  textPlaceholder: string

  // Background
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgElevated: string
  bgContainer: string
  bgMask: string

  // Border
  borderPrimary: string
  borderSecondary: string
  borderTertiary: string
  borderColorSplit: string

  // Disabled
  disabledBg: string
  disabledColor: string
  disabledBorder: string

  // Spacing
  spacingXs: string
  spacingSm: string
  spacingMd: string
  spacingLg: string
  spacingXl: string
  spacing2xl: string
  spacing3xl: string

  // Font
  fontSizeXs: string
  fontSizeSm: string
  fontSizeMd: string
  fontSizeLg: string
  fontSizeXl: string
  fontSize2xl: string
  fontSize3xl: string

  fontWeightRegular: number
  fontWeightMedium: number
  fontWeightSemibold: number
  fontWeightBold: number

  // Border
  borderRadiusXs: string
  borderRadiusSm: string
  borderRadiusMd: string
  borderRadiusLg: string
  borderRadiusXl: string

  // Shadow
  shadowSm: string
  shadowMd: string
  shadowLg: string
  shadowXl: string

  // Transition
  transitionFast: string
  transitionNormal: string
  transitionSlow: string
  transitionAll: string

  // Component
  btnHeightMd: string
  btnPaddingMd: string
  inputHeightMd: string
  inputPadding: string
  inputBg: string
  inputBorder: string
  inputBorderRadius: string
  inputFocusBorderColor: string
  inputFocusBoxShadow: string
  inputPlaceholderColor: string
  inputHoverBorderColor: string
}

export const defaultTheme: ThemeTokens = {
  // Primary
  primary: '#1677ff',
  primaryHover: '#4096ff',
  primaryActive: '#0958d9',
  primaryBg: 'rgba(22, 119, 255, 0.06)',
  primaryBorder: 'rgba(22, 119, 255, 0.3)',

  // Success
  success: '#52c41a',
  successHover: '#73d13d',
  successActive: '#389e0d',
  successBg: 'rgba(82, 196, 26, 0.06)',

  // Warning
  warning: '#faad14',
  warningHover: '#ffc53d',
  warningActive: '#d48806',
  warningBg: 'rgba(250, 173, 20, 0.06)',

  // Error
  error: '#ff4d4f',
  errorHover: '#ff7875',
  errorActive: '#cf1322',
  errorBg: 'rgba(255, 77, 79, 0.06)',

  // Text
  textPrimary: 'rgba(0, 0, 0, 0.88)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary: 'rgba(0, 0, 0, 0.45)',
  textQuaternary: 'rgba(0, 0, 0, 0.25)',
  textPlaceholder: 'rgba(0, 0, 0, 0.25)',

  // Background
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgTertiary: '#fafafa',
  bgElevated: '#ffffff',
  bgContainer: '#ffffff',
  bgMask: 'rgba(0, 0, 0, 0.45)',

  // Border
  borderPrimary: '#d9d9d9',
  borderSecondary: '#e8e8e8',
  borderTertiary: '#f0f0f0',
  borderColorSplit: 'rgba(0, 0, 0, 0.06)',

  // Disabled
  disabledBg: 'rgba(0, 0, 0, 0.04)',
  disabledColor: 'rgba(0, 0, 0, 0.25)',
  disabledBorder: '#d9d9d9',

  // Spacing
  spacingXs: '4px',
  spacingSm: '8px',
  spacingMd: '12px',
  spacingLg: '16px',
  spacingXl: '24px',
  spacing2xl: '32px',
  spacing3xl: '48px',

  // Font
  fontSizeXs: '12px',
  fontSizeSm: '13px',
  fontSizeMd: '14px',
  fontSizeLg: '16px',
  fontSizeXl: '20px',
  fontSize2xl: '24px',
  fontSize3xl: '32px',

  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,

  // Border
  borderRadiusXs: '2px',
  borderRadiusSm: '4px',
  borderRadiusMd: '6px',
  borderRadiusLg: '8px',
  borderRadiusXl: '12px',

  // Shadow
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  shadowMd: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02), 0 3px 12px 0 rgba(0, 0, 0, 0.05)',
  shadowLg: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  shadowXl: '0 6px 16px -8px rgba(0, 0, 0, 0.16), 0 9px 28px 0 rgba(0, 0, 0, 0.12), 0 12px 48px 16px rgba(0, 0, 0, 0.09)',

  // Transition
  transitionFast: '0.1s',
  transitionNormal: '0.2s',
  transitionSlow: '0.3s',
  transitionAll: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

  // Component
  btnHeightMd: '32px',
  btnPaddingMd: '8px 16px',
  inputHeightMd: '32px',
  inputPadding: '4px 8px',
  inputBg: '#ffffff',
  inputBorder: '1px solid #d9d9d9',
  inputBorderRadius: '4px',
  inputFocusBorderColor: '#1677ff',
  inputFocusBoxShadow: '0 0 0 2px rgba(22, 119, 255, 0.3)',
  inputPlaceholderColor: 'rgba(0, 0, 0, 0.25)',
  inputHoverBorderColor: '#1677ff',
}

/**
 * 暗黑模式主题
 */
export const darkTheme: Partial<ThemeTokens> = {
  primary: '#1668dc',
  primaryHover: '#3b82f6',
  primaryActive: '#0958d9',
  primaryBg: 'rgba(22, 104, 220, 0.15)',
  primaryBorder: 'rgba(22, 104, 220, 0.3)',

  textPrimary: 'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  textQuaternary: 'rgba(255, 255, 255, 0.25)',
  textPlaceholder: 'rgba(255, 255, 255, 0.25)',

  bgPrimary: '#141414',
  bgSecondary: '#1f1f1f',
  bgTertiary: '#262626',
  bgElevated: '#1f1f1f',
  bgContainer: '#141414',
  bgMask: 'rgba(0, 0, 0, 0.65)',

  borderPrimary: '#434343',
  borderSecondary: '#303030',
  borderTertiary: '#1f1f1f',
  borderColorSplit: 'rgba(255, 255, 255, 0.06)',

  disabledBg: 'rgba(255, 255, 255, 0.04)',
  disabledColor: 'rgba(255, 255, 255, 0.25)',
  disabledBorder: '#434343',

  inputBg: '#141414',
  inputBorder: '1px solid #434343',
}

/**
 * 紧凑模式覆盖
 */
export const compactOverrides: Partial<ThemeTokens> = {
  fontSizeMd: '13px',
  spacingLg: '12px',
  btnHeightMd: '28px',
  btnPaddingMd: '6px 12px',
  inputHeightMd: '28px',
}
