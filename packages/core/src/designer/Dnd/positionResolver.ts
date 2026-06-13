import { arrayMove } from '@dnd-kit/sortable'
import type { FormFieldSchema } from '../../types/schema'
import { CANVAS_ROOT_HEAD_ID, CANVAS_ROOT_ID } from '../Canvas'
import type { FieldIndex } from '../reducer'
import { findInTree } from '../reducer'

export interface ParsedOverId {
  type: 'root' | 'rootHead' | 'container' | 'region' | 'field'
  id: string
  containerId?: string
  regionKey?: string
}

export function parseOverId(overId: string): ParsedOverId {
  if (overId === CANVAS_ROOT_HEAD_ID) return { type: 'rootHead', id: overId }
  if (overId === CANVAS_ROOT_ID) return { type: 'root', id: overId }

  const regionMatch = overId.match(/^(.+)__region_(\w+)$/)
  if (regionMatch) {
    return { type: 'region', id: overId, containerId: regionMatch[1], regionKey: regionMatch[2] }
  }

  if (overId.endsWith('__container')) {
    return { type: 'container', id: overId, containerId: overId.replace(/__container$/, '') }
  }

  return { type: 'field', id: overId }
}

export function resolveContainer(
  parsed: ParsedOverId,
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
): FormFieldSchema | undefined {
  if (!parsed.containerId) return undefined
  return fieldIndex.get(parsed.containerId)?.field ?? findInTree(fields, parsed.containerId)
}

export function findFieldPosition(
  fields: FormFieldSchema[],
  fieldId: string,
  parentId?: string,
): { parentId?: string; index: number; regionKey?: string } | null {
  const field = fields.find((f) => f.id === fieldId)
  if (field) return { parentId, index: fields.indexOf(field), regionKey: field.regionKey }

  for (const f of fields) {
    if (!f.children.length) continue
    const result = findFieldPosition(f.children, fieldId, f.id)
    if (result) return result
  }

  return null
}

export function resolveDropTarget(
  overId: string,
  fields: FormFieldSchema[],
  fieldIndex: FieldIndex,
): { parentId?: string; index: number; regionKey?: string } {
  const parsed = parseOverId(overId)

  if (parsed.type === 'rootHead') return { parentId: undefined, index: 0 }
  if (parsed.type === 'root') return { parentId: undefined, index: fields.length }

  if (parsed.type === 'region' || parsed.type === 'container') {
    const container = resolveContainer(parsed, fields, fieldIndex)
    if (container) {
      return { parentId: parsed.containerId, index: container.children.length, regionKey: parsed.regionKey }
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

export function reorderFieldsInContainer(
  fields: FormFieldSchema[],
  containerId: string | undefined,
  fromIdx: number,
  toIdx: number,
): FormFieldSchema[] {
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
