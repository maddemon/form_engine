import { useCallback } from 'react'

/**
 * 行数据操作 hook
 * 提取 SubForm 中的 handleAddRow / handleRemoveRow 逻辑
 */
export function useSubFormRows(
  value: Record<string, unknown>[],
  onChange: ((val: Record<string, unknown>[]) => void) | undefined,
  children: { name?: string; defaultValue?: unknown }[],
) {
  const handleAddRow = useCallback(() => {
    const newRow: Record<string, unknown> = {}
    children.forEach((child) => {
      newRow[child.name as string] = child.defaultValue ?? ''
    })
    onChange?.([...value, newRow])
  }, [children, onChange, value])

  const handleRemoveRow = useCallback(
    (rowIndex: number) => {
      onChange?.(value.filter((_, i) => i !== rowIndex))
    },
    [onChange, value],
  )

  return { handleAddRow, handleRemoveRow }
}