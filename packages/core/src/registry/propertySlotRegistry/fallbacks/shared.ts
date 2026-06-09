/**
 * Fallback 组件公共样式
 */

import type { CSSProperties } from 'react'

/** fallback textarea 公共样式：复用主题变量，响应暗色主题 */
export const FALLBACK_TEXTAREA_STYLE: CSSProperties = {
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
  fontFamily: 'monospace',
  resize: 'vertical',
}
