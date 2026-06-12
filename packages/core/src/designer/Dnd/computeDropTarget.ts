import type { FormFieldSchema } from '../../types/schema'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import { findFieldPosition } from './positionResolver'

/** 拖拽过程中用于指示插入位置的临时状态 */
export interface DragOverState {
  activeId: string
  parentId?: string
  index: number
  regionKey?: string
  source: 'palette' | 'canvas'
}

/** 计算鼠标悬浮位置对应的目标容器和插入索引 */
export function computeDropTarget(
  activeId: string,
  overId: string,
  source: 'palette' | 'canvas',
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
): DragOverState | null {
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
}