import type { DragOverEvent } from '@dnd-kit/core'
import type React from 'react'
import { isPaletteDrag, type DesignerDragData } from '../../types/designer-drag'
import type { FormFieldSchema } from '../../types/schema'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import { isAncestorOfByIndex } from './positionResolver'
import { computeDropTarget, type DragOverState } from './computeDropTarget'

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
  }
}