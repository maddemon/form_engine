import type { DragEndEvent } from '@dnd-kit/core'
import type React from 'react'
import { isPaletteDrag, toPaletteItem, type DesignerDragData } from '../../types/designer-drag'
import type { LocalePack } from '../../locale'
import type { FormFieldSchema } from '../../types/schema'
import type { DesignerAction } from '../../types/designer'
import type { FieldIndex } from '../reducer'
import { createFieldFromPalette } from '../PalettePanel'
import { resolveDropTarget, findFieldPosition, reorderFieldsInContainer } from './positionResolver'
import type { DragOverState } from './computeDropTarget'

export function createHandleDragEnd(
  clearDndState: () => void,
  updateDragOverState: (state: DragOverState | null) => void,
  lastDragOverKeyRef: React.MutableRefObject<string | null>,
  dragOverStateRef: React.MutableRefObject<DragOverState | null>,
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
  dispatch: React.Dispatch<DesignerAction>,
  locale: LocalePack,
): (event: DragEndEvent) => void {
  return (event: DragEndEvent) => {
    clearDndState()

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
  }
}