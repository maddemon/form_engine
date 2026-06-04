import { PointerSensor, pointerWithin, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { useCallback, useRef, useState } from 'react'
import { isPaletteDrag, toPaletteItem, type DesignerDragData } from '../../types/designer-drag'
import type { FormFieldSchema } from '../../types/schema'
import type { DesignerAction } from '../../types/designer'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import { createFieldFromPalette } from '../FieldList'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'
import { findFieldPosition, isAncestorOfByIndex, reorderFieldsInContainer, resolveDropTarget } from './positionResolver'

export interface DndState {
  activeDragId: UniqueIdentifier | null
  activeDragLabel: string
  activeDragType: string
}

export function useDndHandlers(
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
  dispatch: React.Dispatch<DesignerAction>,
) {
  const [dndState, setDndState] = useState<DndState>({
    activeDragId: null,
    activeDragLabel: '',
    activeDragType: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return [...pointerCollisions].sort((a, b) => {
        const rectA = args.droppableRects.get(a.id)
        const rectB = args.droppableRects.get(b.id)
        if (rectA && rectB) return rectA.width * rectA.height - rectB.width * rectB.height
        return 0
      })
    }
    return []
  }, [])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DesignerDragData | undefined
      let label = ''
      let fieldType = ''

      if (data && isPaletteDrag(data)) {
        label = data.label
        fieldType = data.fieldType
      } else {
        const field = fieldIndex.get(String(event.active.id))?.field ?? findInTree(fields, String(event.active.id))
        if (field) {
          label = field.label || field.type || ''
          fieldType = field.type || ''
        }
      }

      setDndState({ activeDragId: event.active.id, activeDragLabel: label, activeDragType: fieldType })
    },
    [fields, fieldIndex],
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

      const sourceEntry = fieldIndex.get(activeId)
      const sourcePos = sourceEntry
        ? { parentId: sourceEntry.parentId ?? undefined, index: sourceEntry.index, regionKey: sourceEntry.regionKey }
        : findFieldPosition(fields, activeId)
      if (!sourcePos) return

      let targetParentId: string | undefined
      let targetIndex: number
      let targetRegionKey: string | undefined

      const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
      if (regionMatch) {
        const containerId = regionMatch[1]
        targetRegionKey = regionMatch[2]
        if (sourcePos.parentId === containerId) return
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return
        targetParentId = containerId
        targetIndex = container.children.length
      } else if (overId.endsWith('__container')) {
        const containerId = overId.replace(/__container$/, '')
        if (sourcePos.parentId === containerId) return
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return
        targetParentId = containerId
        targetIndex = container.children.length
      } else {
        const overEntry = fieldIndex.get(overId)
        const targetPos = overEntry
          ? { parentId: overEntry.parentId ?? undefined, index: overEntry.index, regionKey: overEntry.regionKey }
          : findFieldPosition(fields, overId)
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
    [fields, fieldIndex, dispatch],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      lastDragOverMoveRef.current = null
      setDndState({ activeDragId: null, activeDragLabel: '', activeDragType: '' })

      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      if (!activeData) return

      if (isPaletteDrag(activeData)) {
        const overStr = String(over.id)
        const isValidCanvasTarget = overStr === CANVAS_ROOT_ID || overStr === CANVAS_ROOT_HEAD_ID || overStr.endsWith('__container') || overStr.includes('__region_') || fieldIndex.has(overStr)
        if (!isValidCanvasTarget) return

        const target = resolveDropTarget(String(over.id), fields, fieldIndex)
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
        const sourceEntry = fieldIndex.get(activeId)
        const sourcePos = sourceEntry
          ? { parentId: sourceEntry.parentId ?? undefined, index: sourceEntry.index, regionKey: sourceEntry.regionKey }
          : findFieldPosition(fields, activeId)
        if (!sourcePos) return
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        if (sourcePos.parentId === containerId && sourcePos.regionKey === targetRegionKey) return

        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return

        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: container.children.length,
          fromParentId: sourcePos.parentId,
          toParentId: containerId,
          regionKey: targetRegionKey,
        })
        return
      }

      if (overId.endsWith('__container')) {
        const containerId = overId.replace(/__container$/, '')
        const sourceEntry = fieldIndex.get(activeId)
        const sourcePos = sourceEntry
          ? { parentId: sourceEntry.parentId ?? undefined, index: sourceEntry.index, regionKey: sourceEntry.regionKey }
          : findFieldPosition(fields, activeId)
        if (!sourcePos) return
        if (sourcePos.parentId === containerId) return
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return

        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: container.children.length,
          fromParentId: sourcePos.parentId,
          toParentId: containerId,
        })
        return
      }

      const sourceEntry = fieldIndex.get(activeId)
      const sourcePos = sourceEntry
        ? { parentId: sourceEntry.parentId ?? undefined, index: sourceEntry.index, regionKey: sourceEntry.regionKey }
        : findFieldPosition(fields, activeId)
      if (!sourcePos) return
      const overEntry = fieldIndex.get(overId)
      const targetPos = overEntry
        ? { parentId: overEntry.parentId ?? undefined, index: overEntry.index, regionKey: overEntry.regionKey }
        : findFieldPosition(fields, overId)
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
    [fields, fieldIndex, dispatch],
  )

  const handleDragCancel = useCallback(() => {
    lastDragOverMoveRef.current = null
    setDndState({ activeDragId: null, activeDragLabel: '', activeDragType: '' })
  }, [])

  return {
    dndState,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
