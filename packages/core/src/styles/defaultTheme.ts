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
  textOnPrimary: string

  // Background
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgElevated: string
  bgContainer: string
  bgMask: string

  // Designer 专用
  primaryHoverBg: string
  textMuted: string
  borderLight: string

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
  spacingXxs: string
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

  // Designer Canvas
  canvasEmptyPadding: string
  canvasEmptyBorderRadius: string
  canvasFieldHoverBorder: string

  // Designer Panel Sizes
  panelFieldListWidth: string
  panelConfigWidth: string

  // Container / Sortable
  containerMinHeight: string

  // Widget 物理尺寸
  widgetPaletteIconBox: string
  widgetPaletteFontSize: string
  widgetFieldHandleFontSize: string
  widgetCanvasDndShadow: string

  // Widget Switch
  widgetSwitchTrackWidth: string
  widgetSwitchTrackHeight: string
  widgetSwitchTrackRadius: string
  widgetSwitchThumbSize: string
  widgetSwitchThumbOffset: string
  widgetSwitchThumbActiveOffset: string
  widgetSwitchShadow: string

  // Widget 输入框内操作按钮（清除、表达式等）
  inputActionSize: string

  // Widget 微调
  widgetCheckboxMargin: string
  widgetInputFontSizeXs: string
  widgetInputFontSizeXxs: string

  // ItemListEditor 物理尺寸
  itemListDragHandleWidth: string
  itemListDragHandleHeight: string
  itemListDragHandleWidthLg: string
  itemListDragHandleHeightLg: string
  itemListRemoveButtonSize: string
  itemListRemoveButtonPadding: string

  // Modal 物理尺寸
  modalWidthSm: string
  modalWidthMd: string
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
  textOnPrimary: '#ffffff',

  // Background
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgTertiary: '#fafafa',
  bgElevated: '#ffffff',
  bgContainer: '#ffffff',
  bgMask: 'rgba(0, 0, 0, 0.45)',

  // Designer 专用
  primaryHoverBg: '#f0f5ff',
  textMuted: '#bbb',
  borderLight: '#eee',

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
  spacingXxs: '2px',
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

  // Designer Canvas
  canvasEmptyPadding: '24px',
  canvasEmptyBorderRadius: 'var(--fe-border-radius-sm)',
  canvasFieldHoverBorder: 'rgba(22, 119, 255, 0.3)',

  // Designer Panel Sizes
  panelFieldListWidth: '220px',
  panelConfigWidth: '280px',

  // Container / Sortable
  containerMinHeight: '60px',

  // Widget 物理尺寸
  widgetPaletteIconBox: '20px',
  widgetPaletteFontSize: '11px',
  widgetFieldHandleFontSize: '12px',
  widgetCanvasDndShadow: '0 2px 8px rgba(22, 119, 255, 0.3)',

  // Widget Switch
  widgetSwitchTrackWidth: '36px',
  widgetSwitchTrackHeight: '20px',
  widgetSwitchTrackRadius: '10px',
  widgetSwitchThumbSize: '16px',
  widgetSwitchThumbOffset: '2px',
  widgetSwitchThumbActiveOffset: '18px',
  widgetSwitchShadow: '0 1px 2px var(--fe-bg-mask)',

  inputActionSize: '16px',

  // Widget 微调
  widgetCheckboxMargin: '0',
  widgetInputFontSizeXs: '11px',
  widgetInputFontSizeXxs: '10px',

  // ItemListEditor 物理尺寸
  itemListDragHandleWidth: '16px',
  itemListDragHandleHeight: '24px',
  itemListDragHandleWidthLg: '20px',
  itemListDragHandleHeightLg: '28px',
  itemListRemoveButtonSize: '18px',
  itemListRemoveButtonPadding: '0',

  // Modal 物理尺寸
  modalWidthSm: '400px',
  modalWidthMd: '520px',
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
  primaryHoverBg: 'rgba(22, 104, 220, 0.2)',

  success: '#49aa19',
  successHover: '#5ab83d',
  successActive: '#3a8c10',
  successBg: 'rgba(73, 170, 25, 0.15)',

  warning: '#d89614',
  warningHover: '#e8b339',
  warningActive: '#b87d0f',
  warningBg: 'rgba(216, 150, 20, 0.15)',

  error: '#dc4446',
  errorHover: '#e85a5c',
  errorActive: '#c13234',
  errorBg: 'rgba(220, 68, 70, 0.15)',

  textPrimary: 'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary: 'rgba(255, 255, 255, 0.45)',
  textQuaternary: 'rgba(255, 255, 255, 0.25)',
  textPlaceholder: 'rgba(255, 255, 255, 0.25)',
  textMuted: 'rgba(255, 255, 255, 0.25)',
  textOnPrimary: '#ffffff',

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
  borderLight: '#303030',

  disabledBg: 'rgba(255, 255, 255, 0.04)',
  disabledColor: 'rgba(255, 255, 255, 0.25)',
  disabledBorder: '#434343',

  spacingXs: '4px',
  spacingSm: '8px',
  spacingMd: '12px',
  spacingLg: '16px',
  spacingXl: '24px',
  spacing2xl: '32px',
  spacing3xl: '48px',

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

  borderRadiusXs: '2px',
  borderRadiusSm: '4px',
  borderRadiusMd: '6px',
  borderRadiusLg: '8px',
  borderRadiusXl: '12px',

  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.16), 0 1px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.10)',
  shadowMd: '0 1px 2px 0 rgba(0, 0, 0, 0.16), 0 1px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 12px 0 rgba(0, 0, 0, 0.15)',
  shadowLg: '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.20)',
  shadowXl: '0 6px 16px -8px rgba(0, 0, 0, 0.48), 0 9px 28px 0 rgba(0, 0, 0, 0.40), 0 12px 48px 16px rgba(0, 0, 0, 0.32)',

  transitionFast: '0.1s',
  transitionNormal: '0.2s',
  transitionSlow: '0.3s',
  transitionAll: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

  btnHeightMd: '32px',
  btnPaddingMd: '8px 16px',
  inputHeightMd: '32px',
  inputPadding: '4px 8px',
  inputBg: '#141414',
  inputBorder: '1px solid #434343',
  inputBorderRadius: '4px',
  inputFocusBorderColor: '#1668dc',
  inputFocusBoxShadow: '0 0 0 2px rgba(22, 104, 220, 0.3)',
  inputPlaceholderColor: 'rgba(255, 255, 255, 0.25)',
  inputHoverBorderColor: '#1668dc',

  canvasFieldHoverBorder: 'rgba(22, 104, 220, 0.3)',
}

/**
 * 紧凑模式覆盖
 */
export const compactOverrides: Partial<ThemeTokens> = {
  fontSizeXs: '11px',
  fontSizeSm: '12px',
  fontSizeMd: '13px',
  fontSizeLg: '14px',
  fontSizeXl: '16px',
  fontSize2xl: '20px',
  fontSize3xl: '24px',

  spacingXxs: '1px',
  spacingXs: '2px',
  spacingSm: '4px',
  spacingMd: '8px',
  spacingLg: '12px',
  spacingXl: '16px',
  spacing2xl: '24px',
  spacing3xl: '32px',

  borderRadiusXs: '1px',
  borderRadiusSm: '2px',
  borderRadiusMd: '4px',

  btnHeightMd: '28px',
  btnPaddingMd: '6px 12px',
  inputHeightMd: '28px',
  inputPadding: '2px 6px',
  inputBorderRadius: '2px',
}
