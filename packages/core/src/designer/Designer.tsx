import { closestCorners, DndContext, DragOverlay, PointerSensor, pointerWithin, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useEffect, useCallback, useReducer, useState } from 'react'
import type { DeviceScene } from '../registry/componentRegistry'
import { setScene } from '../registry/componentRegistry'
import type { FormEngineAdapter } from '../types/adapter'
import { isContainerComponent } from '../types/component-category'
import type { PaletteGroup } from '../types/designer'
import { isPaletteDrag, toPaletteItem, type DesignerDragData } from '../types/designer-drag'
import type { FormFieldSchema, FormSchema } from '../types/schema'
import { Canvas } from './Canvas'
import { DesignerContext } from './DesignerContext'
import { createFieldFromPalette, FieldList, getFullPaletteGroups, iconMap } from './FieldList'
import { PropertyPanel } from './PropertyPanel'
import type { DesignerStateWithHistory } from './reducer'
import { designerReducerWithHistory, findInTree } from './reducer'

export const CANVAS_ROOT_ID = 'canvas-root'
const CANVAS_ROOT_HEAD_ID = 'canvas-root-head'

function findFieldPosition(fields: FormFieldSchema[], fieldId: string): { parentId?: string; index: number } | null {
  const rootIdx = fields.findIndex((f) => f.id === fieldId)
  if (rootIdx >= 0) return { parentId: undefined, index: rootIdx }

  for (const container of fields) {
    if (!container.children) continue
    const childIdx = container.children.findIndex((c) => c.id === fieldId)
    if (childIdx >= 0) return { parentId: container.id, index: childIdx }
  }

  return null
}

function resolveDropTarget(overId: string, fields: FormFieldSchema[]): { parentId?: string; index: number } {
  if (overId === CANVAS_ROOT_HEAD_ID) return { parentId: undefined, index: 0 }
  if (overId === CANVAS_ROOT_ID) return { parentId: undefined, index: fields.length }

  // Container inner droppable (ID format: fieldId__container)
  if (overId.endsWith('__container')) {
    const containerId = overId.replace(/__container$/, '')
    const container = findInTree(fields, containerId)
    if (container) {
      return { parentId: containerId, index: container.children?.length || 0 }
    }
  }

  // Sortable field: insert after it within its parent
  const rootIdx = fields.findIndex((f) => f.id === overId)
  if (rootIdx >= 0) return { parentId: undefined, index: rootIdx + 1 }

  for (const container of fields) {
    if (!container.children) continue
    const childIdx = container.children.findIndex((c) => c.id === overId)
    if (childIdx >= 0) return { parentId: container.id, index: childIdx + 1 }
  }

  return { parentId: undefined, index: fields.length }
}

interface DesignerProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  onSceneChange?: (scene: DeviceScene) => void
  groups?: PaletteGroup[]
  excludeTypes?: string[]
  readOnly?: boolean
  adapter?: FormEngineAdapter
}

export const Designer: React.FC<DesignerProps> = ({ schema: externalSchema, onSchemaChange, onSceneChange, groups, excludeTypes, readOnly = false, adapter }) => {
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

  useEffect(() => {
    if (externalSchema) {
      dispatch({ type: 'SET_SCHEMA', schema: externalSchema })
    }
  }, [externalSchema])

  useEffect(() => {
    setScene(scene)
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
      const activeData = args.active.data.current as DesignerDragData | undefined
      if (activeData && isPaletteDrag(activeData)) {
        const pointerCoords = args.pointerCoordinates
        const fields = state.schema.fields

        // Detect container edge zones to allow root-level insertion
        // Only redirect to container inner droppable when pointer is explicitly over the container's inner area
        if (pointerCoords && fields.length > 0) {
          for (const field of fields) {
            if (!isContainerComponent(field.type)) continue
            const containerRect = args.droppableRects.get(field.id!)
            if (!containerRect) continue

            const { top, bottom, left, right } = containerRect
            if (pointerCoords.y >= top && pointerCoords.y <= bottom && pointerCoords.x >= left && pointerCoords.x <= right) {
              const height = bottom - top
              const relY = pointerCoords.y - top
              const edgeZone = height * 0.2

              const containerIndex = fields.findIndex((f) => f.id === field.id)
              // containerIndex is always >= 0 here since we're iterating root-level fields

              if (relY < edgeZone) {
                // Near top edge → insert before the container at root level
                if (containerIndex > 0 && fields[containerIndex - 1]?.id) {
                  return [{ id: fields[containerIndex - 1].id! }]
                }
                return [{ id: CANVAS_ROOT_HEAD_ID }]
              }
              if (relY > height - edgeZone) {
                // Near bottom edge → insert after the container at root level
                return [{ id: field.id! }]
              }

              // Middle area: check if pointer is over the container's inner droppable area
              const innerDropId = `${field.id}__container`
              const innerRect = args.droppableRects.get(innerDropId)
              if (innerRect) {
                const { top: it, bottom: ib, left: il, right: ir } = innerRect
                // Pointer is inside the inner droppable area → drop into container
                if (pointerCoords.y >= it && pointerCoords.y <= ib && pointerCoords.x >= il && pointerCoords.x <= ir) {
                  return [{ id: innerDropId }]
                }
              }

              // Pointer is NOT in the inner droppable → use pointerWithin to find root-level drop target
              // Filter out container inner droppables from the result
              const pointerCollisions = pointerWithin(args)
              const rootOnly = pointerCollisions.filter((c) => {
                const idStr = String(c.id)
                if (idStr === CANVAS_ROOT_ID || idStr === CANVAS_ROOT_HEAD_ID) return true
                if (idStr.endsWith('__container')) return false
                return fields.some((f) => f.id === c.id)
              })
              return rootOnly.length > 0 ? rootOnly : [{ id: CANVAS_ROOT_ID }]
            }
          }
        }

        // Fallback: use pointerWithin first, then closestCorners
        const insideDroppables = pointerWithin(args)
        if (insideDroppables.length === 0) return closestCorners(args)
        return insideDroppables
      }
      const pointerCollisions = pointerWithin(args)
      if (pointerCollisions.length > 0) return pointerCollisions
      return closestCorners(args)
    },
    [state.schema.fields],
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

  // 画布内拖拽：在 onDragOver 时实时更新排序
  // 使用 arrayMove 让 dnd-kit 的 sortable 策略自动计算正确位置
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      // 只处理画布内拖拽（非 palette 拖拽）
      if (activeData && isPaletteDrag(activeData)) return

      const activeId = String(active.id)
      const overId = String(over.id)

      // 忽略特殊 ID 和容器内部 droppable
      if (overId === CANVAS_ROOT_ID || overId === CANVAS_ROOT_HEAD_ID || overId.endsWith('__container')) return

      const fields = state.schema.fields

      // 查找源和目标的位置（只处理根级别）
      const sourceIdx = fields.findIndex(f => f.id === activeId)
      const targetIdx = fields.findIndex(f => f.id === overId)
      if (sourceIdx < 0 || targetIdx < 0) return

      // 用 arrayMove 计算新顺序并 dispatch
      const newFields = arrayMove(fields, sourceIdx, targetIdx)
      dispatch({ type: 'REORDER_FIELDS', fields: newFields })
    },
    [state.schema.fields, dispatch],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      setActiveDragLabel('')
      setActiveDragType('')
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      if (!activeData) return

      const fields = state.schema.fields

      if (isPaletteDrag(activeData)) {
        // Only allow dropping on valid canvas droppables
        const isValidCanvasTarget = over.id === CANVAS_ROOT_ID || over.id === CANVAS_ROOT_HEAD_ID || String(over.id).endsWith('__container') || fields.some((f) => f.id === over.id) || fields.some((f) => f.children?.some((c) => c.id === over.id))
        if (!isValidCanvasTarget) return

        const target = resolveDropTarget(String(over.id), fields)
        const newField = createFieldFromPalette(toPaletteItem(activeData))
        dispatch({ type: 'ADD_FIELD', field: newField, index: target.index, parentId: target.parentId })
        return
      }

      // 画布内拖拽：排序已在 onDragOver 时完成，这里只需清除拖拽状态
      // 跨容器拖拽：交给 MOVE_FIELD 处理
      if (active.id === over.id) return

      const sourcePos = findFieldPosition(fields, String(active.id))
      if (!sourcePos) return
      const targetPos = findFieldPosition(fields, String(over.id))
      if (!targetPos) return

      // 跨容器拖拽
      if (sourcePos.parentId !== targetPos.parentId) {
        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: targetPos.index,
          fromParentId: sourcePos.parentId,
          toParentId: targetPos.parentId,
        })
      }
    },
    [state.schema.fields, dispatch],
  )

  const handleDragCancel = useCallback(() => {
    setActiveDragId(null)
    setActiveDragLabel('')
    setActiveDragType('')
  }, [])

  return (
    <div className="designer-scroll-container" style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, sans-serif', background: '#f5f5f5', overflow: 'hidden' }}>
      <style>{`
          .designer-scroll-container ::-webkit-scrollbar { width: 5px; height: 5px; }
          .designer-scroll-container ::-webkit-scrollbar-track { background: transparent; }
          .designer-scroll-container ::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 3px; }
          .designer-scroll-container ::-webkit-scrollbar-thumb:hover { background: #ccc; }
        `}</style>
      <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
        {/* 左侧控件库 */}
        {!readOnly && <FieldList groups={finalGroups} />}

        {/* 中间画布 */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <DesignerContext.Provider value={{ dispatch, selectedFieldId: state.selectedFieldId, onSelectField: handleSelectField, scene }}>
            <Canvas fields={state.schema.fields} activeId={activeDragId} onSceneChange={setSceneState} canUndo={canUndo} canRedo={canRedo} />
          </DesignerContext.Provider>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragLabel ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: '#1890ff',
                color: '#fff',
                borderRadius: 4,
                fontSize: 12,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{iconMap[activeDragType] || null}</span>
              {activeDragLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 右侧属性面板 */}
      <PropertyPanel field={selectedField} formConfig={state.schema.form || { layout: 'vertical', size: 'middle' }} submitConfig={state.schema.submit || { text: '提交', showReset: true, resetText: '重置' }} dispatch={dispatch} adapter={adapter} scene={scene} onSceneChange={setSceneState} />
    </div>
  )
}
