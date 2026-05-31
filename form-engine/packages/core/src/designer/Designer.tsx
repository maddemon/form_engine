import React, { useReducer, useCallback, useState, useEffect } from 'react'
import type { FormSchema, FormConfig, SubmitConfig } from '../types/schema'
import type { DesignerAction, PaletteItem, PaletteGroup } from '../types/designer'
import type { FormEngineAdapter } from '../types/adapter'
import { FieldList, defaultPaletteGroups } from './FieldList'
import { Canvas } from './Canvas'
import { PropertyPanel } from './PropertyPanel'
import type { DeviceScene } from '../registry/componentRegistry'
import { setScene } from '../registry/componentRegistry'

/**
 * 默认表单配置
 */
const DEFAULT_FORM_CONFIG: FormConfig = {
  layout: 'vertical',
  size: 'middle',
}

const DEFAULT_SUBMIT_CONFIG: SubmitConfig = {
  text: '提交',
  showReset: true,
  resetText: '重置',
}

/**
 * designer reducer（含 undo/redo 快照）
 */
function designerReducer(
  state: {
    schema: FormSchema
    selectedFieldId: string | null
    snapshots: FormSchema['fields'][]
    historyIndex: number
  },
  action: DesignerAction,
): {
  schema: FormSchema
  selectedFieldId: string | null
  snapshots: FormSchema['fields'][]
  historyIndex: number
} {
  // 需要推快照的 action 列表
  const shouldSnapshot = [
    'ADD_FIELD',
    'REMOVE_FIELD',
    'MOVE_FIELD',
    'UPDATE_FIELD',
  ].includes(action.type)

  // 计算下一 state（不含快照）
  let next: {
    schema: FormSchema
    selectedFieldId: string | null
  }

  switch (action.type) {
    case 'SELECT_FIELD':
      next = { ...state, selectedFieldId: action.fieldId }
      break

    case 'ADD_FIELD': {
      const fields = [...state.schema.fields]
      fields.splice(action.index, 0, action.field)
      next = {
        ...state,
        selectedFieldId: action.field.id!,
        schema: { ...state.schema, fields },
      }
      break
    }

    case 'REMOVE_FIELD': {
      const fields = state.schema.fields.filter((f: any) => f.id !== action.fieldId)
      next = {
        ...state,
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        schema: { ...state.schema, fields },
      }
      break
    }

    case 'MOVE_FIELD': {
      const fields = [...state.schema.fields]
      const [moved] = fields.splice(action.fromIndex, 1)
      fields.splice(action.toIndex, 0, moved)
      next = { ...state, schema: { ...state.schema, fields } }
      break
    }

    case 'UPDATE_FIELD': {
      const fields = state.schema.fields.map((f: any) =>
        f.id === action.fieldId ? { ...f, ...action.patch } : f,
      )
      next = { ...state, schema: { ...state.schema, fields } }
      break
    }

    case 'UPDATE_FORM_CONFIG':
      next = {
        ...state,
        schema: { ...state.schema, form: { ...state.schema.form, ...action.patch } },
      }
      break

    case 'UPDATE_SUBMIT_CONFIG':
      next = {
        ...state,
        schema: { ...state.schema, submit: { ...state.schema.submit, ...action.patch } },
      }
      break

    case 'SET_SCHEMA': {
      const stillExists = (action.schema.fields as any[]).some((f: any) => f.id === state.selectedFieldId)
      next = {
        ...state,
        schema: action.schema,
        selectedFieldId: stillExists ? state.selectedFieldId : null,
      }
      break
    }

    case 'UNDO': {
      const idx = Math.max(state.historyIndex - 1, 0)
      const fields = state.snapshots[idx] || []
      return {
        ...state,
        historyIndex: idx,
        schema: { ...state.schema, fields },
        snapshots: state.snapshots,
      }
    }

    case 'REDO': {
      const idx = Math.min(state.historyIndex + 1, state.snapshots.length - 1)
      const fields = state.snapshots[idx] || []
      return {
        ...state,
        historyIndex: idx,
        schema: { ...state.schema, fields },
        snapshots: state.snapshots,
      }
    }

    default:
      return state
  }

  if (shouldSnapshot) {
    const trimmed = state.snapshots.slice(0, state.historyIndex + 1)
    const nextSnapshots = [...trimmed, JSON.parse(JSON.stringify(next.schema.fields))]
    if (nextSnapshots.length > 50) nextSnapshots.shift()
    return {
      ...next,
      snapshots: nextSnapshots,
      historyIndex: nextSnapshots.length - 1,
    }
  }

  return {
    ...next,
    snapshots: state.snapshots,
    historyIndex: state.historyIndex,
  }
}

interface DesignerProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  onSceneChange?: (scene: DeviceScene) => void
  groups?: PaletteGroup[]
  readOnly?: boolean
  adapter?: FormEngineAdapter
}

export const Designer: React.FC<DesignerProps> = ({
  schema: externalSchema,
  onSchemaChange,
  onSceneChange,
  groups = defaultPaletteGroups,
  readOnly = false,
  adapter,
}) => {
  const [state, dispatch] = useReducer(designerReducer, {
    schema: externalSchema || {
      version: '0.1',
      name: '未命名表单',
      fields: [],
      form: DEFAULT_FORM_CONFIG,
      submit: DEFAULT_SUBMIT_CONFIG,
    },
    selectedFieldId: null,
    snapshots: [[]],
    historyIndex: 0,
  })

  const [scene, setSceneState] = useState<DeviceScene>('desktop')
  const [mode, setMode] = useState<'design' | 'preview'>('design')

  // 同步外部 schema
  React.useEffect(() => {
    if (externalSchema) {
      dispatch({ type: 'SET_SCHEMA', schema: externalSchema })
    }
  }, [externalSchema])

  // 同步场景到 core 全局状态（供 getComponent 使用）
  React.useEffect(() => {
    setScene(scene)
    onSceneChange?.(scene)
  }, [scene, onSceneChange])

  // 通知外部 schema 变化
  const notifyChange = useCallback(
    (s: FormSchema) => {
      onSchemaChange?.(s)
    },
    [onSchemaChange],
  )

  React.useEffect(() => {
    notifyChange(state.schema)
  }, [state.schema, notifyChange])

  const selectedField = state.schema.fields.find((f: any) => f.id === state.selectedFieldId) || null

  const handlePaletteDragStart = useCallback(
    (item: PaletteItem, event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData('designer-drag', JSON.stringify({
        source: 'palette',
        fieldType: item.type,
        label: item.label,
        defaultProps: item.defaultProps || {},
      }))
      event.dataTransfer.effectAllowed = 'copy'
    },
    [],
  )

  const handleSelectField = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_FIELD', fieldId: id })
  }, [])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.snapshots.length - 1

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, sans-serif', background: '#f5f5f5', overflow: 'hidden' }}>
      {/* 左侧控件库 */}
      {!readOnly && (
        <FieldList
          groups={groups}
          onDragStart={handlePaletteDragStart}
        />
      )}

      {/* 中间画布 */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Canvas
          fields={state.schema.fields}
          selectedFieldId={state.selectedFieldId}
          dispatch={dispatch}
          onSelectField={handleSelectField}
          schema={state.schema}
          scene={scene}
          onSceneChange={setSceneState}
          canUndo={canUndo}
          canRedo={canRedo}
          mode={mode}
          onModeChange={setMode}
        />
      </div>

      {/* 右侧属性面板 */}
      <PropertyPanel
        field={selectedField}
        formConfig={state.schema.form || DEFAULT_FORM_CONFIG}
        submitConfig={state.schema.submit || DEFAULT_SUBMIT_CONFIG}
        dispatch={dispatch}
        adapter={adapter}
        scene={scene}
        onSceneChange={setSceneState}
      />
    </div>
  )
}
