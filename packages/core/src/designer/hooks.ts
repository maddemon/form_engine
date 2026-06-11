import { useCallback, useMemo, useReducer, useState } from 'react'
import type { DeviceScene } from '../types/adapter'
import type { DesignerAction, PaletteItem } from '../types/designer'
import { type FormConfig, type FormFieldSchema, type FormSchema } from '../types/schema'
import { useLocale } from '../locale'
import { createFieldFromPalette } from './FieldList'
import type { DesignerState } from './reducer'
import { designerReducer, findInTree } from './reducer'

// ===========================
// Hooks
// ===========================

/**
 * @deprecated 请使用 `<Designer>` 组件或 `useReducer(designerReducerWithHistory, ...)`。
 * 此 hook 使用 `designerReducer`（无撤销重做），与 `Designer.tsx` 的实现不一致。
 * 将在下个大版本删除。
 */
export function useFormDesigner(form: FormSchema) {
  const { locale } = useLocale()
  const [state, dispatch] = useReducer(designerReducer, {
    schema: form,
    selectedFieldId: null,
  } as DesignerState)

  const selectedField = useMemo(() => (state.selectedFieldId ? findInTree(state.schema.fields, state.selectedFieldId) || null : null), [state.schema.fields, state.selectedFieldId])

  // ---- 便捷方法 ----
  const selectField = useCallback((id: string | null) => dispatch({ type: 'SELECT_FIELD', fieldId: id }), [])

  const addField = useCallback((field: FormFieldSchema, index?: number) => dispatch({ type: 'ADD_FIELD', field, index: index ?? state.schema.fields.length }), [state.schema.fields.length])

  const removeField = useCallback((fieldId: string) => dispatch({ type: 'REMOVE_FIELD', fieldId }), [])

  const moveField = useCallback((fromIndex: number, toIndex: number) => dispatch({ type: 'MOVE_FIELD', fromIndex, toIndex }), [])

  const updateField = useCallback((fieldId: string, patch: Partial<FormFieldSchema>) => dispatch({ type: 'UPDATE_FIELD', fieldId, patch }), [])

  const updateFormConfig = useCallback((patch: Partial<FormConfig>) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch }), [])

  const setSchema = useCallback((schema: FormSchema) => dispatch({ type: 'SET_SCHEMA', schema }), [])

  // 从控件库添加字段
  const addFieldFromPalette = useCallback(
    (item: PaletteItem, index?: number) => {
      const field = createFieldFromPalette(item, locale)
      addField(field, index)
      return field
    },
    [addField, locale],
  )

  return {
    state,
    dispatch,
    /** 当前选中的字段（computed） */
    selectedField,
    /** 选中字段 id */
    selectedFieldId: state.selectedFieldId,
    /** 表单 schema */
    schema: state.schema,
    /** 字段列表 */
    fields: state.schema.fields,
    /** 表单配置 */
    formConfig: state.schema.form || { size: 'middle', desktop: { layout: 'horizontal', labelAlign: 'right', labelCol: { span: 6 }, wrapperCol: { span: 18 } }, mobile: { layout: 'vertical' } },
    // 操作方法
    selectField,
    addField,
    removeField,
    moveField,
    updateField,
    updateFormConfig,
    setSchema,
    addFieldFromPalette,
  }
}

/**
 * 场景切换 Hook
 *
 * @example
 * ```tsx
 * const [scene, setScene] = useDesignerScene()
 * ```
 */
export function useDesignerScene(initialScene: DeviceScene = 'desktop') {
  const [scene, setScene] = useState<DeviceScene>(initialScene)
  return [scene, setScene] as const
}

/**
 * @deprecated 撤销/重做已由 `designerReducerWithHistory` 统一管理，此 hook 冗余。
 * 将在下个大版本删除。
 */
export function useDesignerHistory(_getFields: () => FormFieldSchema[]) {
  const [snapshots, setSnapshots] = useState<FormFieldSchema[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const pushSnapshot = useCallback(
    (nextFields: FormFieldSchema[]) => {
      setSnapshots((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1)
        const next = [...trimmed, structuredClone(nextFields)]
        if (next.length > 50) next.shift()
        return next
      })
      setHistoryIndex((prev) => Math.min(prev + 1, 49))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    setHistoryIndex((i) => Math.max(i - 1, 0))
  }, [])

  const redo = useCallback(() => {
    setHistoryIndex((i) => Math.min(i + 1, snapshots.length - 1))
  }, [snapshots.length])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < snapshots.length - 1

  // 当前快照
  const currentSnapshot = snapshots[historyIndex] || []

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    pushSnapshot,
    currentSnapshot,
    snapshots,
    historyIndex,
  }
}

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
