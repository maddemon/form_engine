import { DndContext, DragOverlay } from '@dnd-kit/core'
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { getComponentIcon } from '../components'
import { useEnsureDefaultTheme, useStyle } from '../styles'
import type { DeviceScene, FormEngineAdapter } from '../types/adapter'
import type { PaletteGroup, PanelWidths, PropertyPanelTab, SidePanelTab } from '../types/designer'
import type { FormFieldSchema, FormSchema } from '../types/schema'
import { Canvas } from './Canvas'
import { DesignerDispatchContext, DesignerSelectionContext, DesignerConfigContext } from './DesignerContext'
import { useDndHandlers } from './Dnd/useDndHandlers'
import { FieldList, getFullPaletteGroups } from './FieldList'
import { PropertyPanel } from './PropertyPanel'
import type { DesignerStateWithHistory } from './reducer'
import { buildFieldIndex, designerReducerWithHistory, findInTree, type FieldIndex } from './reducer'
import { useDesignerSync } from './useDesignerSync'

function useFieldIndex(fields: FormFieldSchema[]): FieldIndex {
  const prevFieldsRef = useRef<FormFieldSchema[]>(fields)
  const indexRef = useRef<FieldIndex>(buildFieldIndex(fields))

  if (prevFieldsRef.current !== fields) {
    const prev = prevFieldsRef.current
    const changed = fields.length !== prev.length || fields.some((f, i) => f !== prev[i])
    if (changed) {
      indexRef.current = buildFieldIndex(fields)
    }
    prevFieldsRef.current = fields
  }

  return indexRef.current
}

interface DesignerProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  onSceneChange?: (scene: DeviceScene) => void
  groups?: PaletteGroup[]
  excludeTypes?: string[]
  readOnly?: boolean
  desktopAdapter?: FormEngineAdapter
  mobileAdapter?: FormEngineAdapter
  panelWidths?: PanelWidths
  sidePanelTabs?: SidePanelTab[]
  propertyPanelTabs?: PropertyPanelTab[]
}

export const Designer: React.FC<DesignerProps> = ({ schema, onSchemaChange, onSceneChange, groups, excludeTypes, readOnly = false, desktopAdapter, mobileAdapter, panelWidths, sidePanelTabs, propertyPanelTabs }) => {
  useEnsureDefaultTheme()
  const finalGroups = groups || getFullPaletteGroups(excludeTypes)

  const [state, dispatch] = useReducer(designerReducerWithHistory, {
    schema,
    selectedFieldId: null,
    snapshots: [[]],
    historyIndex: 0,
  } as DesignerStateWithHistory)

  const [scene, setSceneState] = useState<DeviceScene>('desktop')

  useDesignerSync(schema, state.schema, onSchemaChange, dispatch)

  useEffect(() => {
    onSceneChange?.(scene)
  }, [scene, onSceneChange])

  const fieldIndex = useFieldIndex(state.schema.fields)
  const selectedField = state.selectedFieldId
    ? (fieldIndex.get(state.selectedFieldId)?.field ?? findInTree(state.schema.fields, state.selectedFieldId)) || null
    : null

  // 根据 scene 选取画布 adapter；属性面板始终优先使用 desktopAdapter
  const canvasAdapter = desktopAdapter && mobileAdapter ? (scene === 'mobile' ? mobileAdapter : desktopAdapter) : ((desktopAdapter ?? mobileAdapter) as FormEngineAdapter)
  const widgetsAdapter = (desktopAdapter ?? mobileAdapter) as FormEngineAdapter

  const handleSelectField = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_FIELD', fieldId: id })
  }, [])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.snapshots.length - 1

  // DnD handlers
  const { dndState, sensors, collisionDetection, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDndHandlers(state.schema.fields, fieldIndex, dispatch)

  const formConfig = state.schema.form

  const dispatchCtx = useMemo(() => ({ dispatch }), [dispatch])
  const selectionCtx = useMemo(() => ({ selectedFieldId: state.selectedFieldId, onSelectField: handleSelectField }), [state.selectedFieldId, handleSelectField])
  const configCtx = useMemo(() => ({ scene, formConfig, adapter: canvasAdapter, desktopAdapter: widgetsAdapter }), [scene, formConfig, canvasAdapter, widgetsAdapter])

  const { token } = useStyle()
  return (
    <DesignerDispatchContext.Provider value={dispatchCtx}>
      <DesignerSelectionContext.Provider value={selectionCtx}>
        <DesignerConfigContext.Provider value={configCtx}>
      <div className="designer-scroll-container" style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, sans-serif', background: 'var(--fe-bg-secondary)', overflow: 'hidden' }}>
        <style>{`
          .designer-scroll-container ::-webkit-scrollbar { width: var(--fe-spacing-xs); height: var(--fe-spacing-xs); }
          .designer-scroll-container ::-webkit-scrollbar-track { background: transparent; }
          .designer-scroll-container ::-webkit-scrollbar-thumb { background: var(--fe-border-primary); border-radius: var(--fe-border-radius-sm); }
          .designer-scroll-container ::-webkit-scrollbar-thumb:hover { background: var(--fe-text-tertiary); }
        `}</style>
        <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          {!readOnly && <FieldList groups={finalGroups} width={panelWidths?.palette} sidePanelTabs={sidePanelTabs} fields={state.schema.fields} selectedFieldId={state.selectedFieldId} dispatch={dispatch} />}

          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <Canvas fields={state.schema.fields} activeId={dndState.activeDragId} onSceneChange={setSceneState} canUndo={canUndo} canRedo={canRedo} />
          </div>

          <DragOverlay dropAnimation={null}>
            {dndState.activeDragLabel ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--fe-spacing-xs)',
                  padding: '4px 10px',
                  background: 'var(--fe-primary)',
                  color: 'var(--fe-bg-primary)',
                  borderRadius: 'var(--fe-border-radius-sm)',
                  fontSize: 'var(--fe-font-size-sm)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  boxShadow: token('widgetCanvasDndShadow') as React.CSSProperties['boxShadow'],
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getComponentIcon(dndState.activeDragType) || null}</span>
                {dndState.activeDragLabel}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <PropertyPanel field={selectedField} formConfig={state.schema.form} dispatch={dispatch} designerWidgets={widgetsAdapter?.designerWidgets} width={panelWidths?.properties} propertyPanelTabs={propertyPanelTabs} allFields={state.schema.fields} />
      </div>
        </DesignerConfigContext.Provider>
      </DesignerSelectionContext.Provider>
    </DesignerDispatchContext.Provider>
  )
}
