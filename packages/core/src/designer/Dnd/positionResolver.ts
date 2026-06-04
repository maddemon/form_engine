import { arrayMove } from '@dnd-kit/sortable'
import type { FormFieldSchema } from '../../types/schema'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'

export function findFieldPosition(fields: FormFieldSchema[], fieldId: string, parentId?: string): { parentId?: string; index: number; regionKey?: string } | null {
  const field = fields.find((f) => f.id === fieldId)
  if (field) return { parentId, index: fields.indexOf(field), regionKey: field.regionKey }

  for (const f of fields) {
    if (!f.children.length) continue
    const result = findFieldPosition(f.children, fieldId, f.id)
    if (result) return result
  }

  return null
}

export function resolveDropTarget(overId: string, fields: FormFieldSchema[], fieldIndex: FieldIndex): { parentId?: string; index: number; regionKey?: string } {
  if (overId === CANVAS_ROOT_HEAD_ID) return { parentId: undefined, index: 0 }
  if (overId === CANVAS_ROOT_ID) return { parentId: undefined, index: fields.length }

  if (overId.endsWith('__container')) {
    const containerId = overId.replace(/__container$/, '')
    const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
    if (container) {
      return { parentId: containerId, index: container.children.length }
    }
  }

  const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
  if (regionMatch) {
    const containerId = regionMatch[1]
    const regionKey = regionMatch[2]
    const container = fieldIndex.get(containerId)?.field ?? findInTree(fields, containerId)
    if (container) {
      return { parentId: containerId, index: container.children.length, regionKey }
    }
  }

  const entry = fieldIndex.get(overId)
  if (entry) {
    return { parentId: entry.parentId ?? undefined, index: entry.index + 1, regionKey: entry.regionKey }
  }

  const pos = findFieldPosition(fields, overId)
  if (pos) return { parentId: pos.parentId, index: pos.index + 1, regionKey: pos.regionKey }

  return { parentId: undefined, index: fields.length }
}

export function reorderFieldsInContainer(fields: FormFieldSchema[], containerId: string | undefined, fromIdx: number, toIdx: number): FormFieldSchema[] {
  if (!containerId) return arrayMove(fields, fromIdx, toIdx)
  return fields.map((f) => {
    if (f.id === containerId) {
      return { ...f, children: arrayMove(f.children, fromIdx, toIdx) }
    }
    if (f.children.length) {
      return { ...f, children: reorderFieldsInContainer(f.children, containerId, fromIdx, toIdx) }
    }
    return f
  })
}

export function isAncestorOfByIndex(fieldIndex: FieldIndex, ancestorId: string, descendantId: string): boolean {
  if (ancestorId === descendantId) return true
  const entry = fieldIndex.get(descendantId)
  if (!entry) return false
  return entry.path.includes(ancestorId)
}
