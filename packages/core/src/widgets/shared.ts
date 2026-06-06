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

/** 输入控件样式合并工具：统一 BASE_STYLE + FOCUS_STYLE + disabled 逻辑 */
export function getInputControlStyle(options: {
  focused?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}): React.CSSProperties {
  return {
    ...BASE_STYLE,
    ...(options.focused ? FOCUS_STYLE : {}),
    opacity: options.disabled ? 0.5 : 1,
    cursor: options.disabled ? 'not-allowed' : 'text',
    ...options.style,
  }
}
