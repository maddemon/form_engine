/**
 * Form Engine Adapter — 组件工厂
 *
 * 封装 adapter 组件中的通用逻辑：
 * - locale fallback placeholder
 * - isComposing 检查（Input / TextArea）
 *
 * 使用方式见各组件文件。
 */

import { useCallback } from 'react'
import { useLocale } from '@form-engine/core/locale'
import type React from 'react'

/** adapter.common.placeholder 支持的 key */
type PlaceholderKey = 'input' | 'select' | 'date' | 'time' | 'number' | 'search'

/**
 * Hook：获取 locale 兜底的 placeholder
 *
 * @param placeholderProp - 用户传入的 placeholder（优先使用）
 * @param key             - locale 中对应的 key
 *
 * @example
 * const placeholder = useAdapterPlaceholder(placeholderProp, 'input')
 * // → placeholderProp ?? locale.adapter.common.placeholder.input
 */
export function useAdapterPlaceholder(
  placeholderProp: string | undefined,
  key: PlaceholderKey,
): string {
  const { locale } = useLocale()
  return placeholderProp ?? locale.adapter.common.placeholder[key]
}

/**
 * Hook：创建带 isComposing 检查的 Change 处理器
 *
 * 用于 Input / TextArea 等文本输入组件，避免在输入法组合状态下触发 onChange。
 *
 * @example
 * const handleChange = useComposingChange(onChange)
 * // onChange 只在 isComposing === false 时调用
 */
export function useComposingChange(
  onChange: ((value: string) => void) | undefined,
): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if ((e.nativeEvent as InputEvent)?.isComposing) return
      onChange?.(e.target.value)
    },
    [onChange],
  )
}