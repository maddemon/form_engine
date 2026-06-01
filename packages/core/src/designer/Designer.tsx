import React, { useReducer, useCallback, useState } from 'react'
import type { FormSchema } from '../types/schema'
import type { PaletteItem, PaletteGroup } from '../types/designer'
import type { FormEngineAdapter } from '../types/adapter'
import { FieldList, getFullPaletteGroups } from './FieldList'
import { Canvas } from './Canvas'
import { PropertyPanel } from './PropertyPanel'
import type { DeviceScene } from '../registry/componentRegistry'
import { setScene } from '../registry/componentRegistry'
import { designerReducerWithHistory } from './reducer'
import type { DesignerStateWithHistory } from './reducer'

interface DesignerProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  onSceneChange?: (scene: DeviceScene) => void
  groups?: PaletteGroup[]
  excludeTypes?: string[]
  readOnly?: boolean
  adapter?: FormEngineAdapter
}

export const Designer: React.FC<DesignerProps> = ({
  schema: externalSchema,
  onSchemaChange,
  onSceneChange,
  groups,
  excludeTypes,
  readOnly = false,
  adapter,
}) => {
  // 如果没有传入 groups，则使用包含自定义组件的完整控件库
  const finalGroups = groups || getFullPaletteGroups(excludeTypes)
  
  const [state, dispatch] = useReducer(designerReducerWithHistory, {
    schema: externalSchema || {
      version: '0.1',
      name: '未命名表单',
      fields: [],
      form: { layout: 'vertical', size: 'middle' },
      submit: { text: '提交', showReset: true, resetText: '重置' },
    },
    selectedFieldId: null,
    snapshots: [[]],
    historyIndex: 0,
  } as DesignerStateWithHistory)

  const [scene, setSceneState] = useState<DeviceScene>('desktop')

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

  const selectedField = state.schema.fields.find((f) => f.id === state.selectedFieldId) || null

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
          groups={finalGroups}
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
          scene={scene}
          onSceneChange={setSceneState}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* 右侧属性面板 */}
      <PropertyPanel
        field={selectedField}
        formConfig={state.schema.form || { layout: 'vertical', size: 'middle' }}
        submitConfig={state.schema.submit || { text: '提交', showReset: true, resetText: '重置' }}
        dispatch={dispatch}
        adapter={adapter}
        scene={scene}
        onSceneChange={setSceneState}
      />
    </div>
  )
}
