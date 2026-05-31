/**
 * Form Engine Designer Hooks
 *
 * 提供一组 React Hooks，方便开发者在自定义设计器时
 * 读取和修改表单 schema、选中字段等状态。
 */

import { useReducer, useCallback, useMemo, useState } from 'react'
import type {
  FormSchema,
  FormFieldSchema,
  FormConfig,
  SubmitConfig,
} from '../../types/schema'
import type { DesignerAction, PaletteItem } from '../../types/designer'
import { createFieldFromPalette, generateFieldId } from './FieldList'
import type { DeviceScene } from '../../registry/componentRegistry'

// ===========================
// 默认配置
// ===========================

const DEFAULT_FORM_CONFIG: FormConfig = {
  layout: 'vertical',
  size: 'middle',
}

const DEFAULT_SUBMIT_CONFIG: SubmitConfig = {
  text: '提交',
  showReset: true,
  resetText: '重置',
}

// ===========================
// Reducer
// ===========================

function designerReducer(
  state: {
    schema: FormSchema
    selectedFieldId: string | null
  },
  action: DesignerAction,
): {
  schema: FormSchema
  selectedFieldId: string | null
} {
  switch (action.type) {
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId }

    case 'ADD_FIELD': {
      const fields = [...state.schema.fields]
      fields.splice(action.index, 0, action.field)
      return {
        ...state,
        selectedFieldId: action.field.id!,
        schema: { ...state.schema, fields },
      }
    }

    case 'REMOVE_FIELD': {
      const fields = state.schema.fields.filter(f => f.id !== action.fieldId)
      return {
        ...state,
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        schema: { ...state.schema, fields },
      }
    }

    case 'MOVE_FIELD': {
      const fields = [...state.schema.fields]
      const [moved] = fields.splice(action.fromIndex, 1)
      fields.splice(action.toIndex, 0, moved)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'UPDATE_FIELD': {
      const fields = state.schema.fields.map(f =>
        f.id === action.fieldId ? { ...f, ...action.patch } : f,
      )
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'UPDATE_FORM_CONFIG':
      return {
        ...state,
        schema: { ...state.schema, form: { ...state.schema.form, ...action.patch } },
      }

    case 'UPDATE_SUBMIT_CONFIG':
      return {
        ...state,
        schema: { ...state.schema, submit: { ...state.schema.submit, ...action.patch } },
      }

    case 'SET_SCHEMA': {
      const stillExists = action.schema.fields.some(f => f.id === state.selectedFieldId)
      return {
        ...state,
        schema: action.schema,
        selectedFieldId: stillExists ? state.selectedFieldId : null,
      }
    }

    default:
      return state
  }
}

// ===========================
// Hooks
// ===========================

/**
 * 核心 Hook：管理表单设计器完整状态
 *
 * @example
 * ```tsx
 * function MyDesigner() {
 *   const { state, dispatch, selectedField, addField, updateField } = useFormDesigner()
 *   return <div>...</div>
 * }
 * ```
 */
export function useFormDesigner(initialSchema?: FormSchema) {
  const [state, dispatch] = useReducer(designerReducer, {
    schema: initialSchema || {
      version: '0.1',
      name: '未命名表单',
      fields: [],
      form: DEFAULT_FORM_CONFIG,
      submit: DEFAULT_SUBMIT_CONFIG,
    },
    selectedFieldId: null,
  })

  const selectedField = useMemo(
    () => state.schema.fields.find(f => f.id === state.selectedFieldId) || null,
    [state.schema.fields, state.selectedFieldId],
  )

  // ---- 便捷方法 ----
  const selectField = useCallback(
    (id: string | null) => dispatch({ type: 'SELECT_FIELD', fieldId: id }),
    [],
  )

  const addField = useCallback(
    (field: FormFieldSchema, index?: number) =>
      dispatch({ type: 'ADD_FIELD', field, index: index ?? state.schema.fields.length }),
    [state.schema.fields.length],
  )

  const removeField = useCallback(
    (fieldId: string) => dispatch({ type: 'REMOVE_FIELD', fieldId }),
    [],
  )

  const moveField = useCallback(
    (fromIndex: number, toIndex: number) =>
      dispatch({ type: 'MOVE_FIELD', fromIndex, toIndex }),
    [],
  )

  const updateField = useCallback(
    (fieldId: string, patch: Partial<FormFieldSchema>) =>
      dispatch({ type: 'UPDATE_FIELD', fieldId, patch }),
    [],
  )

  const updateFormConfig = useCallback(
    (patch: Partial<FormConfig>) =>
      dispatch({ type: 'UPDATE_FORM_CONFIG', patch }),
    [],
  )

  const updateSubmitConfig = useCallback(
    (patch: Partial<SubmitConfig>) =>
      dispatch({ type: 'UPDATE_SUBMIT_CONFIG', patch }),
    [],
  )

  const setSchema = useCallback(
    (schema: FormSchema) => dispatch({ type: 'SET_SCHEMA', schema }),
    [],
  )

  // 从控件库添加字段
  const addFieldFromPalette = useCallback(
    (item: PaletteItem, index?: number) => {
      const field = createFieldFromPalette(item)
      addField(field, index)
      return field
    },
    [addField],
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
    formConfig: state.schema.form || DEFAULT_FORM_CONFIG,
    /** 提交配置 */
    submitConfig: state.schema.submit || DEFAULT_SUBMIT_CONFIG,

    // 操作方法
    selectField,
    addField,
    removeField,
    moveField,
    updateField,
    updateFormConfig,
    updateSubmitConfig,
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
 * 撤销/重做 Hook（基于快照）
 *
 * @example
 * ```tsx
 * const [canUndo, canRedo, undo, redo] = useDesignerHistory(fields, pushSnapshot)
 * ```
 */
export function useDesignerHistory(getFields: () => FormFieldSchema[]) {
  const [snapshots, setSnapshots] = useState<FormFieldSchema[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)

  const pushSnapshot = useCallback((nextFields: FormFieldSchema[]) => {
    setSnapshots(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      const next = [...trimmed, JSON.parse(JSON.stringify(nextFields))]
      if (next.length > 50) next.shift()
      return next
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    setHistoryIndex(i => Math.max(i - 1, 0))
  }, [])

  const redo = useCallback(() => {
    setHistoryIndex(i => Math.min(i + 1, snapshots.length - 1))
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
