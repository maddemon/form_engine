import { DndContext, DragOverlay, PointerSensor, pointerWithin, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { getComponentIcon } from '../components/paletteRegistry'
import type { DeviceScene } from '../types/adapter'
import { useEnsureDefaultTheme, useStyle } from '../styles'
import type { FormEngineAdapter } from '../types/adapter'
import type { PaletteGroup, PanelWidths, SidePanelTab, PropertyPanelTab } from '../types/designer'
import { isPaletteDrag, toPaletteItem, type DesignerDragData } from '../types/designer-drag'
import { type FormFieldSchema, type FormSchema } from '../types/schema'
import { Canvas, CANVAS_ROOT_ID, CANVAS_ROOT_HEAD_ID } from './Canvas'
import { DesignerContext } from './DesignerContext'
import { createFieldFromPalette, FieldList, getFullPaletteGroups } from './FieldList'
import { PropertyPanel } from './PropertyPanel'
import type { DesignerStateWithHistory } from './reducer'
import { designerReducerWithHistory, findInTree } from './reducer'
import { DEFAULT_SCHEMA } from './hooks'

function findFieldPosition(fields: FormFieldSchema[], fieldId: string, parentId?: string): { parentId?: string; index: number; regionKey?: string } | null {
  const field = fields.find(f => f.id === fieldId)
  if (field) return { parentId, index: fields.indexOf(field), regionKey: field.regionKey }

  for (const f of fields) {
    if (!f.children) continue
    const result = findFieldPosition(f.children, fieldId, f.id)
    if (result) return result
  }

  return null
}

function resolveDropTarget(overId: string, fields: FormFieldSchema[]): { parentId?: string; index: number; regionKey?: string } {
  if (overId === CANVAS_ROOT_HEAD_ID) return { parentId: undefined, index: 0 }
  if (overId === CANVAS_ROOT_ID) return { parentId: undefined, index: fields.length }

  if (overId.endsWith('__container')) {
    const containerId = overId.replace(/__container$/, '')
    const container = findInTree(fields, containerId)
    if (container) {
      return { parentId: containerId, index: container.children?.length || 0 }
    }
  }

  const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
  if (regionMatch) {
    const containerId = regionMatch[1]
    const regionKey = regionMatch[2]
    const container = findInTree(fields, containerId)
    if (container) {
      return { parentId: containerId, index: container.children?.length || 0, regionKey }
    }
  }

  const pos = findFieldPosition(fields, overId)
  if (pos) return { parentId: pos.parentId, index: pos.index + 1, regionKey: pos.regionKey }

  return { parentId: undefined, index: fields.length }
}

function reorderFieldsInContainer(fields: FormFieldSchema[], containerId: string | undefined, fromIdx: number, toIdx: number): FormFieldSchema[] {
  if (!containerId) return arrayMove(fields, fromIdx, toIdx)
  return fields.map(f => {
    if (f.id === containerId && f.children) {
      return { ...f, children: arrayMove(f.children, fromIdx, toIdx) }
    }
    if (f.children) {
      return { ...f, children: reorderFieldsInContainer(f.children, containerId, fromIdx, toIdx) }
    }
    return f
  })
}

function isAncestorOf(fields: FormFieldSchema[], ancestorId: string, descendantId: string): boolean {
  if (ancestorId === descendantId) return true
  for (const f of fields) {
    if (f.id === ancestorId && f.children) {
      return findInTree(f.children, descendantId) !== undefined
    }
    if (f.children) {
      const result = isAncestorOf(f.children, ancestorId, descendantId)
      if (result) return true
    }
  }
  return false
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

export const Designer: React.FC<DesignerProps> = ({ schema: externalSchema, onSchemaChange, onSceneChange, groups, excludeTypes, readOnly = false, desktopAdapter, mobileAdapter, panelWidths, sidePanelTabs, propertyPanelTabs }) => {
  useEnsureDefaultTheme()
  const finalGroups = groups || getFullPaletteGroups(excludeTypes)

  const [state, dispatch] = useReducer(designerReducerWithHistory, {
    schema: externalSchema || DEFAULT_SCHEMA,
    selectedFieldId: null,
    snapshots: [[]],
    historyIndex: 0,
  } as DesignerStateWithHistory)

  const [scene, setSceneState] = useState<DeviceScene>('desktop')

  useEffect(() => {
    if (externalSchema) {
      dispatch({ type: 'SET_SCHEMA', schema: externalSchema })
    }
  }, [externalSchema])

  useEffect(() => {
    onSceneChange?.(scene)
  }, [scene, onSceneChange])

  const notifyChange = useCallback(
    (s: FormSchema) => {
      onSchemaChange?.(s)
    },
    [onSchemaChange],
  )

  useEffect(() => {
    notifyChange(state.schema)
  }, [state.schema, notifyChange])

  const selectedField = state.selectedFieldId ? findInTree(state.schema.fields, state.selectedFieldId) || null : null

  // 根据 scene 选取画布 adapter；属性面板始终优先使用 desktopAdapter
  const canvasAdapter = (desktopAdapter && mobileAdapter)
    ? (scene === 'mobile' ? mobileAdapter : desktopAdapter)
    : (desktopAdapter ?? mobileAdapter) as FormEngineAdapter
  const widgetsAdapter = (desktopAdapter ?? mobileAdapter) as FormEngineAdapter

  const handleSelectField = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_FIELD', fieldId: id })
  }, [])

  const canUndo = state.historyIndex > 0
  const canRedo = state.historyIndex < state.snapshots.length - 1

  // dndkit state & handlers
  const [activeDragId, setActiveDragId] = useState<UniqueIdentifier | null>(null)
  const [activeDragLabel, setActiveDragLabel] = useState<string>('')
  const [activeDragType, setActiveDragType] = useState<string>('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }))

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      const pointerCollisions = pointerWithin(args)

      if (pointerCollisions.length > 0) {
        // 按布局面积排序：更小的区域 = 更具体（如字段 > region > container > 根级）
        return [...pointerCollisions].sort((a, b) => {
          const rectA = args.droppableRects.get(a.id)
          const rectB = args.droppableRects.get(b.id)
          if (rectA && rectB) {
            return (rectA.width * rectA.height) - (rectB.width * rectB.height)
          }
          return 0
        })
      }

      // 指针不在任何 droppable 内时不返回碰撞，避免从控件库拖拽时自动高亮
      return []
    },
    [],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DesignerDragData | undefined
      let label = ''
      let fieldType = ''

      if (data && isPaletteDrag(data)) {
        // 从控件库拖拽
        label = data.label
        fieldType = data.fieldType
      } else {
        // 从画布拖拽组件
        const fields = state.schema.fields
        const field = findInTree(fields, String(event.active.id))
        if (field) {
          label = field.label || field.type || ''
          fieldType = field.type || ''
        }
      }

      setActiveDragId(event.active.id)
      setActiveDragLabel(label)
      setActiveDragType(fieldType)
    },
    [state.schema.fields],
  )

  const lastDragOverMoveRef = useRef<string | null>(null)

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      if (activeData && isPaletteDrag(activeData)) return

      const activeId = String(active.id)
      const overId = String(over.id)

      if (overId === CANVAS_ROOT_ID || overId === CANVAS_ROOT_HEAD_ID) return

      const fields = state.schema.fields
      const sourcePos = findFieldPosition(fields, activeId)
      if (!sourcePos) return

      let targetParentId: string | undefined
      let targetIndex: number
      let targetRegionKey: string | undefined

      const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
      if (regionMatch) {
        const containerId = regionMatch[1]
        targetRegionKey = regionMatch[2]
        if (sourcePos.parentId === containerId) return
        if (isAncestorOf(fields, activeId, containerId)) return
        const container = findInTree(fields, containerId)
        if (!container) return
        targetParentId = containerId
        targetIndex = (container.children?.length || 0)
      } else if (overId.endsWith('__container')) {
        const containerId = overId.replace(/__container$/, '')
        if (sourcePos.parentId === containerId) return
        if (isAncestorOf(fields, activeId, containerId)) return
        const container = findInTree(fields, containerId)
        if (!container) return
        targetParentId = containerId
        targetIndex = container.children?.length || 0
      } else {
        const targetPos = findFieldPosition(fields, overId)
        if (!targetPos) return
        if (sourcePos.parentId === targetPos.parentId) return
        targetParentId = targetPos.parentId
        targetIndex = targetPos.index
        targetRegionKey = targetPos.regionKey
      }

      const moveKey = `${activeId}->${targetParentId || 'root'}:${targetIndex}`
      if (lastDragOverMoveRef.current === moveKey) return
      lastDragOverMoveRef.current = moveKey

      dispatch({
        type: 'MOVE_FIELD',
        fromIndex: sourcePos.index,
        toIndex: targetIndex,
        fromParentId: sourcePos.parentId,
        toParentId: targetParentId,
        regionKey: targetRegionKey,
      })
    },
    [state.schema.fields, dispatch],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      lastDragOverMoveRef.current = null
      setActiveDragId(null)
      setActiveDragLabel('')
      setActiveDragType('')
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      if (!activeData) return

      const fields = state.schema.fields

      if (isPaletteDrag(activeData)) {
        const overStr = String(over.id)
        const isValidCanvasTarget = overStr === CANVAS_ROOT_ID || overStr === CANVAS_ROOT_HEAD_ID || overStr.endsWith('__container') || overStr.includes('__region_') || fields.some((f) => f.id === overStr) || fields.some((f) => f.children?.some((c) => c.id === overStr))
        if (!isValidCanvasTarget) return

        const target = resolveDropTarget(String(over.id), fields)
        const newField = createFieldFromPalette(toPaletteItem(activeData))
        dispatch({ type: 'ADD_FIELD', field: newField, index: target.index, parentId: target.parentId, regionKey: target.regionKey })
        return
      }

      const activeId = String(active.id)
      const overId = String(over.id)
      if (activeId === overId) return

      const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
      if (regionMatch) {
        const containerId = regionMatch[1]
        const targetRegionKey = regionMatch[2]
        const sourcePos = findFieldPosition(fields, activeId)
        if (!sourcePos) return
        if (isAncestorOf(fields, activeId, containerId)) return
        if (sourcePos.parentId === containerId && sourcePos.regionKey === targetRegionKey) return

        const container = findInTree(fields, containerId)
        if (!container) return
        const targetIndex = container.children?.length || 0

        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: targetIndex,
          fromParentId: sourcePos.parentId,
          toParentId: containerId,
          regionKey: targetRegionKey,
        })
        return
      }

      if (overId.endsWith('__container')) {
        const containerId = overId.replace(/__container$/, '')
        const sourcePos = findFieldPosition(fields, activeId)
        if (!sourcePos) return
        if (sourcePos.parentId === containerId) return
        if (isAncestorOf(fields, activeId, containerId)) return
        const container = findInTree(fields, containerId)
        if (!container) return
        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: container.children?.length || 0,
          fromParentId: sourcePos.parentId,
          toParentId: containerId,
        })
        return
      }

      const sourcePos = findFieldPosition(fields, activeId)
      if (!sourcePos) return
      const targetPos = findFieldPosition(fields, overId)
      if (!targetPos) return

      if (sourcePos.parentId === targetPos.parentId) {
        if (sourcePos.regionKey !== targetPos.regionKey) {
          dispatch({
            type: 'MOVE_FIELD',
            fromIndex: sourcePos.index,
            toIndex: targetPos.index,
            fromParentId: sourcePos.parentId,
            toParentId: targetPos.parentId,
            regionKey: targetPos.regionKey,
          })
        } else {
          const newFields = reorderFieldsInContainer(fields, sourcePos.parentId, sourcePos.index, targetPos.index)
          dispatch({ type: 'REORDER_FIELDS', fields: newFields })
        }
      } else {
        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: targetPos.index,
          fromParentId: sourcePos.parentId,
          toParentId: targetPos.parentId,
          regionKey: targetPos.regionKey,
        })
      }
    },
    [state.schema.fields, dispatch],
  )

  const handleDragCancel = useCallback(() => {
    lastDragOverMoveRef.current = null
    setActiveDragId(null)
    setActiveDragLabel('')
    setActiveDragType('')
  }, [])

  const contextValue = useMemo(() => ({
    dispatch,
    selectedFieldId: state.selectedFieldId,
    onSelectField: handleSelectField,
    scene,
    formConfig: state.schema.form,
    adapter: canvasAdapter,
    desktopAdapter: widgetsAdapter,
  }), [dispatch, state.selectedFieldId, handleSelectField, scene, state.schema.form, canvasAdapter, widgetsAdapter])

  const { token } = useStyle()
  return (
    <DesignerContext.Provider value={contextValue}>
    <div className="designer-scroll-container" style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, sans-serif', background: 'var(--fe-bg-secondary)', overflow: 'hidden' }}>
      <style>{`
          .designer-scroll-container ::-webkit-scrollbar { width: var(--fe-spacing-xs); height: var(--fe-spacing-xs); }
          .designer-scroll-container ::-webkit-scrollbar-track { background: transparent; }
          .designer-scroll-container ::-webkit-scrollbar-thumb { background: var(--fe-border-primary); border-radius: var(--fe-border-radius-sm); }
          .designer-scroll-container ::-webkit-scrollbar-thumb:hover { background: var(--fe-text-tertiary); }
        `}</style>
      <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        {/* 左侧控件库 */}
        {!readOnly && <FieldList groups={finalGroups} width={panelWidths?.palette} sidePanelTabs={sidePanelTabs} fields={state.schema.fields} selectedFieldId={state.selectedFieldId} dispatch={dispatch} />}

        {/* 中间画布 */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Canvas fields={state.schema.fields} activeId={activeDragId} onSceneChange={setSceneState} canUndo={canUndo} canRedo={canRedo} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragLabel ? (
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
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{getComponentIcon(activeDragType) || null}</span>
              {activeDragLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 右侧属性面板 */}
      <PropertyPanel field={selectedField} formConfig={state.schema.form} dispatch={dispatch} designerWidgets={widgetsAdapter?.designerWidgets} width={panelWidths?.properties} propertyPanelTabs={propertyPanelTabs} allFields={state.schema.fields} />
    </div>
    </DesignerContext.Provider>
  )
}