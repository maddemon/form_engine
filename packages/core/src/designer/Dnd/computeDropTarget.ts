import type { FormFieldSchema } from '../../types/schema'
import type { FieldIndex } from '../reducer'
import { findFieldPosition, parseOverId, resolveContainer } from './positionResolver'

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
    const parsed = parseOverId(overId)

    if (parsed.type === 'rootHead') return { activeId, parentId: undefined, index: 0 }
    if (parsed.type === 'root') return { activeId, parentId: undefined, index: fields.length }

    if (parsed.type === 'region' || parsed.type === 'container') {
      const container = resolveContainer(parsed, fields, fieldIndex)
      if (container) {
        return { activeId, parentId: parsed.containerId, index: container.children.length, regionKey: parsed.regionKey }
      }
    }

    const overEntry = fieldIndex.get(overId)
    if (overEntry) {
      return {
        activeId,
        parentId: overEntry.parentId ?? undefined,
        index: overEntry.index,
        regionKey: overEntry.regionKey,
      }
    }

    const pos = findFieldPosition(fields, overId)
    if (pos) return { activeId, parentId: pos.parentId, index: pos.index, regionKey: pos.regionKey }

    return null
  }
  const result = base()
  return result ? { ...result, source } : null
}
