import { useCallback, useEffect, useRef, useState } from 'react'
import type { DesignerAction } from '../../types/designer'

/**
 * 字段级防抖更新 Hook
 *
 * 封装 "本地即时反馈 + 防抖 dispatch UPDATE_FIELD" 模式，
 * 消除 PropertyPanel / RulesEditor / StaticExpressionToggle 等处
 * 重复的 `(v) => dispatch({ type: 'UPDATE_FIELD', fieldId, patch: { [key]: ... } })` 模板。
 *
 * 典型用法：
 * ```ts
 * const [labelValue, handleLabelChange] = useDebouncedFieldUpdate(
 *   dispatch, field.id, 'label', field.label ?? '',
 *   { transform: (v) => String(v) || undefined },
 * )
 * ```
 *
 * @param dispatch - designer reducer 的 dispatch
 * @param fieldId - 目标字段 ID
 * @param key - 要更新的字段属性键
 * @param externalValue - 来自 schema 的外部值（用于初始化与外部变更同步）
 * @param options.transform - 将本地输入转换为 patch 值的钩子（默认原样写入）
 * @param options.skip - 返回 true 时跳过本次 dispatch（用于校验失败等场景）
 * @param options.delay - 防抖延迟（毫秒），默认 300ms
 * @returns [localValue, handleChange] - 本地值与变更处理器
 */
export function useDebouncedFieldUpdate<T>(
  dispatch: React.Dispatch<DesignerAction>,
  fieldId: string,
  key: string,
  externalValue: T,
  options?: {
    transform?: (value: T) => unknown
    skip?: (value: T) => boolean
    delay?: number
  },
): [T, (value: T) => void] {
  const transform = options?.transform
  const skip = options?.skip
  const delay = options?.delay ?? 300

  const [localValue, setLocalValue] = useState<T>(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isEditingRef = useRef(false)
  const dispatchRef = useRef(dispatch)
  const transformRef = useRef(transform)
  const skipRef = useRef(skip)

  // 保持回调 ref 为最新（effect 中更新，避免 render 中访问 ref）
  useEffect(() => {
    dispatchRef.current = dispatch
  })
  useEffect(() => {
    transformRef.current = transform
  })
  useEffect(() => {
    skipRef.current = skip
  })

  // 外部值变化时同步到本地（仅当用户未在编辑时，避免覆盖用户输入）
  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const handleChange = useCallback(
    (value: T) => {
      isEditingRef.current = true
      setLocalValue(value)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        isEditingRef.current = false
        if (skipRef.current?.(value)) return
        const next = transformRef.current ? transformRef.current(value) : value
        dispatchRef.current({ type: 'UPDATE_FIELD', fieldId, patch: { [key]: next } })
      }, delay)
    },
    [fieldId, key, delay],
  )

  // 组件卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [localValue, handleChange]
}
