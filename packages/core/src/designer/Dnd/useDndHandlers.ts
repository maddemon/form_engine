import { PointerSensor, pointerWithin, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { useCallback, useRef, useState } from 'react'
import { isPaletteDrag, type DesignerDragData } from '../../types/designer-drag'
import type { FormFieldSchema } from '../../types/schema'
import type { DesignerAction } from '../../types/designer'
import { useLocale } from '../../locale'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'
import { computeDropTarget, type DragOverState } from './computeDropTarget'
import { createHandleDragOver } from './handleDragOver'
import { createHandleDragEnd } from './handleDragEnd'

export type { DragOverState } from './computeDropTarget'

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
  const { locale } = useLocale()

  const [dndState, setDndState] = useState<DndState>({
    activeDragId: null,
    activeDragLabel: '',
    activeDragType: '',
  })

  const [dragOverState, setDragOverState] = useState<DragOverState | null>(null)
  const dragOverStateRef = useRef<DragOverState | null>(null)

  const updateDragOverState = useCallback((state: DragOverState | null) => {
    dragOverStateRef.current = state
    setDragOverState(state)
  }, [])

  /** 带去重的更新：相同位置不重复 setState */
  const lastDragOverKeyRef = useRef<string | null>(null)
  const tryUpdateDragOverState = useCallback((state: DragOverState) => {
    const key = `${state.activeId}|${state.parentId ?? ''}|${state.index}|${state.regionKey ?? ''}|${state.source}`
    if (lastDragOverKeyRef.current === key) return
    lastDragOverKeyRef.current = key
    updateDragOverState(state)
  }, [updateDragOverState])

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

  // ── handleDragStart ───────────────────────────────────────────────

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
    [fieldIndex],
  )

  // ── handleDragOver ────────────────────────────────────────────────

  const handleDragOver = useCallback(
    createHandleDragOver(tryUpdateDragOverState, updateDragOverState, lastDragOverKeyRef, fields, fieldIndex),
    [fields, fieldIndex, tryUpdateDragOverState, updateDragOverState],
  )

  // ── handleDragEnd（一次性提交最终操作）───────────────────────────

  const clearDndState = useCallback(() => {
    setDndState({ activeDragId: null, activeDragLabel: '', activeDragType: '' })
  }, [])

  const handleDragEnd = useCallback(
    createHandleDragEnd(clearDndState, updateDragOverState, lastDragOverKeyRef, dragOverStateRef, fields, fieldIndex, dispatch, locale),
    [fields, fieldIndex, dispatch, locale, updateDragOverState, clearDndState],
  )

  const handleDragCancel = useCallback(() => {
    lastDragOverKeyRef.current = null
    setDndState({ activeDragId: null, activeDragLabel: '', activeDragType: '' })
    updateDragOverState(null)
  }, [updateDragOverState])

  return {
    dndState,
    dragOverState,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}