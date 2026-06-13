import type { DragOverEvent } from '@dnd-kit/core'
import type React from 'react'
import { isPaletteDrag, type DesignerDragData } from '../../types/designer-drag'
import type { FormFieldSchema } from '../../types/schema'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import type { FieldIndex } from '../reducer'
import { computeDropTarget, type DragOverState } from './computeDropTarget'
import { isAncestorOfByIndex, parseOverId, resolveContainer } from './positionResolver'

export function createHandleDragOver(
  tryUpdateDragOverState: (state: DragOverState) => void,
  updateDragOverState: (state: DragOverState | null) => void,
  lastDragOverKeyRef: React.MutableRefObject<string | null>,
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
): (event: DragOverEvent) => void {
  return (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as DesignerDragData | undefined
    const activeId = String(active.id)
    const overId = String(over.id)

    // Palette 拖拽：进入字段区域后才显示指示器
    if (activeData && isPaletteDrag(activeData)) {
      if (overId === CANVAS_ROOT_HEAD_ID || overId === CANVAS_ROOT_ID) return
      const target = computeDropTarget(activeId, overId, 'palette', fields, fieldIndex)
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
    const parsed = parseOverId(overId)
    if (parsed.type === 'region') {
      if (isAncestorOfByIndex(fieldIndex, activeId, parsed.containerId!)) return
      const container = resolveContainer(parsed, fields, fieldIndex)
      if (!container) return
      tryUpdateDragOverState({
        activeId,
        parentId: parsed.containerId,
        index: container.children.length,
        regionKey: parsed.regionKey,
        source: 'canvas',
      })
      return
    }

    // 拖到容器空白区
    if (parsed.type === 'container') {
      if (isAncestorOfByIndex(fieldIndex, activeId, parsed.containerId!)) return
      const container = resolveContainer(parsed, fields, fieldIndex)
      if (!container) return
      tryUpdateDragOverState({
        activeId,
        parentId: parsed.containerId,
        index: container.children.length,
        source: 'canvas',
      })
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
        updateDragOverState({
          activeId,
          parentId: overEntry.parentId ?? undefined,
          index: overEntry.index,
          regionKey: overEntry.regionKey,
          source: 'canvas',
        })
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
  }
}
