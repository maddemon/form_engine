import React from 'react'

export const BASE_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 6px',
  borderRadius: 'var(--fe-border-radius-sm)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--fe-border-primary)',
  fontSize: 'var(--fe-font-size-sm)',
  lineHeight: '18px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'var(--fe-bg-primary)',
  color: 'var(--fe-text-primary)',
}

export const FOCUS_STYLE: React.CSSProperties = {
  borderColor: 'var(--fe-primary)',
  boxShadow: '0 0 0 2px var(--fe-primary-bg)',
}

export const BORDERLESS_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 0',
  border: 'none',
  outline: 'none',
  fontSize: 'var(--fe-font-size-sm)',
  boxSizing: 'border-box',
  background: 'transparent',
  color: 'inherit',
}

export const FILLED_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 6px',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'transparent',
  borderRadius: 'var(--fe-border-radius-sm)',
  outline: 'none',
  fontSize: 'var(--fe-font-size-sm)',
  lineHeight: '18px',
  boxSizing: 'border-box',
  background: 'var(--fe-bg-tertiary)',
  color: 'var(--fe-text-primary)',
}

/** 输入控件样式合并工具：统一 BASE_STYLE + FOCUS_STYLE + disabled 逻辑 */
export function getInputControlStyle(options: {
  focused?: boolean
  disabled?: boolean
  variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
  style?: React.CSSProperties
}): React.CSSProperties {
  const isBorderless = options.variant === 'borderless'
  const isFilled = options.variant === 'filled'
  return {
    ...(isBorderless ? BORDERLESS_STYLE : isFilled ? FILLED_STYLE : BASE_STYLE),
    ...(isBorderless || isFilled ? {} : options.focused ? FOCUS_STYLE : {}),
    ...(isFilled && options.focused
      ? { borderColor: 'var(--fe-primary)', boxShadow: '0 0 0 2px var(--fe-primary-bg)' }
      : {}),
    opacity: options.disabled ? 0.5 : 1,
    cursor: options.disabled ? 'not-allowed' : 'text',
    ...options.style,
  }
}
