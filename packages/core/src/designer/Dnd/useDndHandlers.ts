import { PointerSensor, pointerWithin, TouchSensor, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from '@dnd-kit/core'
import { useCallback, useRef, useState } from 'react'
import { isPaletteDrag, toPaletteItem, type DesignerDragData } from '../../types/designer-drag'
import type { FormFieldSchema } from '../../types/schema'
import type { DesignerAction } from '../../types/designer'
import { useLocale } from '../../locale'
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

/** 拖拽过程中用于指示插入位置的临时状态 */
export interface DragOverState {
  activeId: string
  parentId?: string
  index: number
  regionKey?: string
  source: 'palette' | 'canvas'
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

  // ── 性能测量 ──────────────────────────────────────────────────────

  const perfRef = useRef({ callCount: 0, totalTime: 0 })

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

      // 重置 perf 数据
      perfRef.current = { callCount: 0, totalTime: 0 }
    },
    [fields, fieldIndex],
  )

  const lastDragOverMoveRef = useRef<string | null>(null)

  /** 计算鼠标悬浮位置对应的目标容器和插入索引 */
  const computeDropTarget = useCallback(
    (activeId: string, overId: string, source: 'palette' | 'canvas'): DragOverState | null => {
      const base = (): Omit<DragOverState, 'source'> | null => {
        if (overId === CANVAS_ROOT_HEAD_ID) return { activeId, parentId: undefined, index: 0 }
        if (overId === CANVAS_ROOT_ID) return { activeId, parentId: undefined, index: fields.length }

        const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
        if (regionMatch) {
          const containerId = regionMatch[1]
          const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
          if (container) {
            return { activeId, parentId: containerId, index: container.children.length, regionKey: regionMatch[2] }
          }
        }

        if (overId.endsWith('__container')) {
          const containerId = overId.replace(/__container$/, '')
          const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
          if (container) {
            return { activeId, parentId: containerId, index: container.children.length }
          }
        }

        const overEntry = fieldIndex.get(overId)
        if (overEntry) {
          return { activeId, parentId: overEntry.parentId ?? undefined, index: overEntry.index, regionKey: overEntry.regionKey }
        }

        const pos = findFieldPosition(fields, overId)
        if (pos) return { activeId, parentId: pos.parentId, index: pos.index, regionKey: pos.regionKey }

        return null
      }
      const result = base()
      return result ? { ...result, source } : null
    },
    [fields, fieldIndex],
  )

  // ── handleDragOver ────────────────────────────────────────────────

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeData = active.data.current as DesignerDragData | undefined
      const activeId = String(active.id)
      const overId = String(over.id)

      // Palette 拖拽：进入字段区域后才显示指示器
      if (activeData && isPaletteDrag(activeData)) {
        if (overId === CANVAS_ROOT_HEAD_ID || overId === CANVAS_ROOT_ID) return
        const target = computeDropTarget(activeId, overId, 'palette')
        if (target) tryUpdateDragOverState(target)
        return
      }

      // 拖到画布空白区：仅当源不在根级时更新
      if (overId === CANVAS_ROOT_ID || overId === CANVAS_ROOT_HEAD_ID) {
        const sourceEntry = fieldIndex.get(activeId)
        if (sourceEntry?.parentId == null) return // 已在根级
        tryUpdateDragOverState({ activeId, parentId: undefined, index: fields.length, source: 'canvas' })
        return
      }

      // 拖到 region 空白区
      const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
      if (regionMatch) {
        const containerId = regionMatch[1]
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return
        tryUpdateDragOverState({ activeId, parentId: containerId, index: container.children.length, regionKey: regionMatch[2], source: 'canvas' })
        return
      }

      // 拖到容器空白区
      if (overId.endsWith('__container')) {
        const containerId = overId.replace(/__container$/, '')
        if (isAncestorOfByIndex(fieldIndex, activeId, containerId)) return
        const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
        if (!container) return
        tryUpdateDragOverState({ activeId, parentId: containerId, index: container.children.length, source: 'canvas' })
        return
      }

      // 拖到某个字段上
      const overEntry = fieldIndex.get(overId)
      if (!overEntry) return

      // 拖到自己：指示器显示当前位置（即无移动）
      if (activeId === overId) {
        const key = `${activeId}|${overEntry.parentId ?? ''}|${overEntry.index}|${overEntry.regionKey ?? ''}|canvas`
        if (lastDragOverKeyRef.current !== key) {
          lastDragOverKeyRef.current = key
          updateDragOverState({ activeId, parentId: overEntry.parentId ?? undefined, index: overEntry.index, regionKey: overEntry.regionKey, source: 'canvas' })
        }
        return
      }

      tryUpdateDragOverState({
        activeId,
        parentId: overEntry.parentId ?? undefined,
        index: overEntry.index,
        regionKey: overEntry.regionKey,
        source: 'canvas',
      })
    },
    [fields, fieldIndex, computeDropTarget, tryUpdateDragOverState, updateDragOverState],
  )

  // ── handleDragEnd（一次性提交最终操作）───────────────────────────

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      lastDragOverMoveRef.current = null
      setDndState({ activeDragId: null, activeDragLabel: '', activeDragType: '' })

      // 日志性能数据
      const { callCount, totalTime } = perfRef.current
      if (callCount > 0) {
        console.log(
          `[Perf] Drag: ${callCount} calls, total ${totalTime.toFixed(1)}ms, avg ${(totalTime / callCount).toFixed(2)}ms/call`,
        )
      }

      const { active, over } = event
      if (!over) { updateDragOverState(null); return }

      const activeData = active.data.current as DesignerDragData | undefined
      if (!activeData) { updateDragOverState(null); return }

      const activeId = String(active.id)
      const dragOver = dragOverStateRef.current

      if (isPaletteDrag(activeData)) {
        // Palette → Canvas：使用临时状态或回退计算
        if (dragOver) {
          const newField = createFieldFromPalette(toPaletteItem(activeData), locale)
          dispatch({
            type: 'ADD_FIELD',
            field: newField,
            index: dragOver.index,
            parentId: dragOver.parentId,
            regionKey: dragOver.regionKey,
          })
        } else {
          const target = resolveDropTarget(String(over.id), fields, fieldIndex)
          const newField = createFieldFromPalette(toPaletteItem(activeData), locale)
          dispatch({ type: 'ADD_FIELD', field: newField, index: target.index, parentId: target.parentId, regionKey: target.regionKey })
        }
        lastDragOverKeyRef.current = null
        updateDragOverState(null)
        return
      }

      // Canvas → Canvas
      if (!dragOver || dragOver.activeId !== activeId) {
        lastDragOverKeyRef.current = null
        updateDragOverState(null)
        return
      }

      const sourceEntry = fieldIndex.get(activeId)
      const sourcePos = sourceEntry
        ? { parentId: sourceEntry.parentId ?? undefined, index: sourceEntry.index, regionKey: sourceEntry.regionKey }
        : findFieldPosition(fields, activeId)
      if (!sourcePos) { updateDragOverState(null); return }

      const { parentId: targetParentId, index: targetIndex, regionKey: targetRegionKey } = dragOver

      // 位置没变：跳过 dispatch
      if (sourcePos.index === targetIndex && sourcePos.parentId === targetParentId && sourcePos.regionKey === targetRegionKey) {
        lastDragOverKeyRef.current = null
        updateDragOverState(null)
        return
      }

      if (sourcePos.parentId === targetParentId && sourcePos.regionKey === targetRegionKey) {
        // 同容器内排序
        const newFields = reorderFieldsInContainer(fields, sourcePos.parentId, sourcePos.index, targetIndex)
        dispatch({ type: 'REORDER_FIELDS', fields: newFields })
      } else {
        // 跨容器移动
        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: sourcePos.index,
          toIndex: targetIndex,
          fromParentId: sourcePos.parentId,
          toParentId: targetParentId,
          regionKey: targetRegionKey,
        })
      }

      lastDragOverKeyRef.current = null
      updateDragOverState(null)
    },
    [fields, fieldIndex, dispatch, locale, updateDragOverState],
  )

  const handleDragCancel = useCallback(() => {
    lastDragOverMoveRef.current = null
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
