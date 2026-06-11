/**
 * Theme Bridge 共享工具函数
 *
 * 供 adapter-antd / adapter-antd-mobile 的 themeBridge 使用。
 */

import type { FieldComponentProps, FieldRendererFn } from '../types/adapter'

// ── 需要追加 px 后缀的 token key ────────────────────────────────

const PX_KEYS = new Set([
  'borderRadiusXs', 'borderRadiusSm', 'borderRadiusMd', 'borderRadiusLg', 'borderRadiusXl',
  'spacingXs', 'spacingSm', 'spacingMd', 'spacingLg', 'spacingXl', 'spacing2xl', 'spacing3xl',
  'fontSizeXs', 'fontSizeSm', 'fontSizeMd', 'fontSizeLg', 'fontSizeXl', 'fontSize2xl', 'fontSize3xl',
])

/**
 * 将 antd/antd-mobile 的 token 值转换为 Form Engine CSS 变量值。
 *
 * 纯数字的 spacing/fontSize/borderRadius 自动追加 'px' 后缀。
 */
export function transformTokenValue(feKey: string, rawValue: string): string {
  if (!rawValue) return rawValue
  if (PX_KEYS.has(feKey) && !isNaN(Number(rawValue)) && !rawValue.includes('px')) {
    return `${rawValue}px`
  }
  return rawValue
}

// ── 兜底渲染组件 ─────────────────────────────────────────────────

/**
 * 未知字段类型的兜底渲染。
 *
 * 使用 CSS 变量引用主题 token，不使用硬编码颜色。
 * 两个 adapter 共享此实现，无需各自重复定义。
 */
export const defaultFieldRenderer: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema } = props
  const displayName = fieldSchema.label || fieldSchema.name || fieldSchema.type
  return (
    <div style={{ padding: 'var(--fe-spacing-xs, 4px) 0', color: 'var(--fe-text-tertiary)', fontSize: 'var(--fe-font-size-xs, 12px)' }}>
      {displayName}
    </div>
  )
}
