import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 为属性面板的受控输入组件提供防抖能力。
 * 维护本地状态以获得即时视觉反馈，通过防抖延迟同步到外部 store。
 *
 * @param externalValue - 外部值（来自 store/field schema）
 * @param onChange - 外部值变更回调
 * @param delay - 防抖延迟（毫秒），默认 300ms
 * @returns [localValue, handleChange] - 本地值与变更处理器
 */
export function useDebouncedInput<T>(externalValue: T, onChange: (value: T) => void, delay: number = 300): [T, (value: T) => void, () => void] {
  const [localValue, setLocalValue] = useState<T>(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isEditingRef = useRef(false)
  const onChangeRef = useRef(onChange)
  // 保持 onChange ref 为最新值（effect 中更新，避免 render 中访问 ref）
  useEffect(() => {
    onChangeRef.current = onChange
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
        onChangeRef.current(value)
      }, delay)
    },
    [delay],
  )

  /** 取消挂起的防抖计时器并重置编辑状态，供外部直接更新值时调用 */
  const cancelPending = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
    isEditingRef.current = false
  }, [])

  // 组件卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [localValue, handleChange, cancelPending]
}

/**
 * 对象键值对防抖 Hook
 *
 * 维护一个 Record<string, unknown> 的本地副本，实现即时视觉反馈，
 * 通过防抖延迟同步到外部（dispatch）。消除 DefaultPropertyContent 中
 * componentProps 防抖逻辑的重复代码。
 *
 * @param externalValue - 外部对象（来自 store/field schema）
 * @param onChange - 整体对象变更回调
 * @param delay - 防抖延迟（毫秒），默认 300ms
 * @returns [localValue, handleKeyChange] - 本地对象与单键变更处理器
 */
export function useDebouncedObjectMap<T extends Record<string, unknown>>(
  externalValue: T,
  onChange: (value: T) => void,
  delay: number = 300,
): [T, (key: string, value: unknown) => void] {
  const [localValue, setLocalValue] = useState<T>(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isEditingRef = useRef(false)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // 外部值变化时同步到本地（仅当用户未在编辑时）
  useEffect(() => {
    if (!isEditingRef.current) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const handleKeyChange = useCallback(
    (key: string, value: unknown) => {
      isEditingRef.current = true
      setLocalValue((prev) => {
        const next = { ...prev, [key]: value }
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          isEditingRef.current = false
          onChangeRef.current(next)
        }, delay)
        return next
      })
    },
    [delay],
  )

  // 组件卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return [localValue, handleKeyChange]
}
