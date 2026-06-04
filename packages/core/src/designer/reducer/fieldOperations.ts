import type { FormFieldSchema } from '../../types/schema'

// ── ID 生成 ────────────────────────────────────────────────────────

let _copyCounter = 0
export function generateFieldId(): string {
  return `field_copy_${Date.now()}_${++_copyCounter}`
}

// ── 树操作工具 ─────────────────────────────────────────────────────

export function insertAfter(fields: FormFieldSchema[], targetId: string, newField: FormFieldSchema): FormFieldSchema[] {
  const idx = fields.findIndex(f => f.id === targetId)
  if (idx >= 0) {
    const result = [...fields]
    result.splice(idx + 1, 0, newField)
    return result
  }
  return fields.map(f =>
    ({ ...f, children: insertAfter(f.children, targetId, newField) }),
  )
}

export function cloneField(field: FormFieldSchema): FormFieldSchema {
  return {
    ...structuredClone(field),
    id: generateFieldId(),
    children: field.children.map(cloneField),
  }
}

export function cloneFields(fields: FormFieldSchema[]): FormFieldSchema[] {
  return structuredClone(fields)
}

export function removeFieldFromTree(
  fields: FormFieldSchema[],
  parentId: string | undefined,
  index: number,
): { fields: FormFieldSchema[]; removed: FormFieldSchema | null } {
  if (parentId) {
    let removed: FormFieldSchema | null = null
    const result = fields.map(n => {
      if (n.id === parentId) {
        removed = n.children[index] || null
        return { ...n, children: n.children.filter((_, i) => i !== index) }
      }
      return { ...n, children: removeFieldFromTree(n.children, parentId, index).fields }
    })
    return { fields: result, removed }
  }
  const copy = [...fields]
  const [removed] = copy.splice(index, 1)
  return { fields: copy, removed: removed || null }
}

export function insertIntoTree(
  fields: FormFieldSchema[],
  parentId: string | undefined,
  index: number,
  field: FormFieldSchema,
): FormFieldSchema[] {
  if (parentId) {
    return fields.map(n => {
      if (n.id === parentId) {
        const children = [...n.children]
        children.splice(index, 0, field)
        return { ...n, children }
      }
      return { ...n, children: insertIntoTree(n.children, parentId, index, field) }
    })
  }
  const copy = [...fields]
  copy.splice(index, 0, field)
  return copy
}

export function removeFieldById(fields: FormFieldSchema[], fieldId: string): FormFieldSchema[] {
  return fields
    .filter(f => f.id !== fieldId)
    .map(f => ({ ...f, children: removeFieldById(f.children, fieldId) }))
}

export function updateFieldInTree(fields: FormFieldSchema[], fieldId: string, patch: Partial<FormFieldSchema>): FormFieldSchema[] {
  return fields.map(f => {
    if (f.id === fieldId) return { ...f, ...patch }
    return { ...f, children: updateFieldInTree(f.children, fieldId, patch) }
  })
}
