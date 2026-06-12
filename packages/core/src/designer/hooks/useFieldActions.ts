import { useCallback } from 'react'
import { DesignerAction, FormFieldSchema } from '../../types'

/**
 * 字段操作 Hook（基于外部 dispatch）
 *
 * 适合在自定义属性面板中使用
 *
 * @example
 * ```tsx
 * function MyPropertyPanel({ dispatch, fieldId }) {
 *   const { updateField } = useFieldActions(dispatch, fieldId)
 *   return <input onChange={e => updateField({ label: e.target.value })} />
 * }
 * ```
 */
export function useFieldActions(dispatch: React.Dispatch<DesignerAction>, fieldId: string | null) {
  const updateField = useCallback(
    (patch: Partial<FormFieldSchema>) => {
      if (!fieldId) return
      dispatch({ type: 'UPDATE_FIELD', fieldId, patch })
    },
    [dispatch, fieldId],
  )

  const removeField = useCallback(() => {
    if (!fieldId) return
    dispatch({ type: 'REMOVE_FIELD', fieldId })
  }, [dispatch, fieldId])

  return { updateField, removeField }
}
