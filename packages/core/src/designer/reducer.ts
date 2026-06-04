import type { FormSchema, FormFieldSchema } from '../types/schema'
import type { DesignerAction } from '../types/designer'

export interface DesignerState {
  schema: FormSchema
  selectedFieldId: string | null
}

export interface DesignerStateWithHistory extends DesignerState {
  snapshots: FormFieldSchema[][]
  historyIndex: number
}

const MAX_SNAPSHOTS = 50

function shouldSnapshot(action: DesignerAction): boolean {
  return ['ADD_FIELD', 'REMOVE_FIELD', 'MOVE_FIELD', 'UPDATE_FIELD', 'COPY_FIELD', 'REORDER_FIELDS'].includes(action.type)
}

function insertAfter(fields: FormFieldSchema[], targetId: string, newField: FormFieldSchema): FormFieldSchema[] {
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

let _copyCounter = 0
function generateFieldId(): string {
  return `field_copy_${Date.now()}_${++_copyCounter}`
}
function cloneField(field: FormFieldSchema): FormFieldSchema {
  return {
    ...structuredClone(field),
    id: generateFieldId(),
    children: field.children.map(cloneField),
  }
}

function cloneFields(fields: FormFieldSchema[]): FormFieldSchema[] {
  return structuredClone(fields)
}

function removeFieldFromTree(
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

function insertIntoTree(
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

function removeFieldById(fields: FormFieldSchema[], fieldId: string): FormFieldSchema[] {
  return fields
    .filter(f => f.id !== fieldId)
    .map(f => ({ ...f, children: removeFieldById(f.children, fieldId) }))
}

function updateFieldInTree(fields: FormFieldSchema[], fieldId: string, patch: Partial<FormFieldSchema>): FormFieldSchema[] {
  return fields.map(f => {
    if (f.id === fieldId) return { ...f, ...patch }
    return { ...f, children: updateFieldInTree(f.children, fieldId, patch) }
  })
}

export interface FieldIndexEntry {
  field: FormFieldSchema
  parentId: string | null
  index: number
  path: string[]
  regionKey?: string
}

export type FieldIndex = Map<string, FieldIndexEntry>

export function buildFieldIndex(fields: FormFieldSchema[]): FieldIndex {
  const index = new Map<string, FieldIndexEntry>()

  function walk(nodes: FormFieldSchema[], parentId: string | null, parentPath: string[]): void {
    nodes.forEach((field, idx) => {
      if (!field.id) return
      const currentPath = [...parentPath, field.id]
      index.set(field.id, { field, parentId, index: idx, path: currentPath, regionKey: field.regionKey })
      if (field.children.length) {
        walk(field.children, field.id, currentPath)
      }
    })
  }

  walk(fields, null, [])
  return index
}

export function findInTree(fields: FormFieldSchema[], id: string): FormFieldSchema | undefined {
  for (const f of fields) {
    if (f.id === id) return f
    const found = findInTree(f.children, id)
    if (found) return found
  }
  return undefined
}

export function collectFieldNames(fields: FormFieldSchema[], excludeFieldId: string): Set<string> {
  const names = new Set<string>()
  const walk = (list: FormFieldSchema[]) => {
    for (const f of list) {
      if (f.id !== excludeFieldId) {
        names.add(f.name)
      }
      walk(f.children)
    }
  }
  walk(fields)
  return names
}

export function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId }

    case 'ADD_FIELD': {
      let fieldToAdd = action.field
      if (action.columnIndex !== undefined) {
        fieldToAdd = { ...fieldToAdd, columnIndex: action.columnIndex }
      }
      if (action.regionKey !== undefined) {
        fieldToAdd = { ...fieldToAdd, regionKey: action.regionKey }
      }
      if (action.parentId) {
        const addToParent = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
          nodes.map(n => {
            if (n.id === action.parentId) return { ...n, children: [...n.children, fieldToAdd] }
            return { ...n, children: addToParent(n.children) }
          })
        return {
          ...state,
          selectedFieldId: action.field.id,
          schema: { ...state.schema, fields: addToParent(state.schema.fields) },
        }
      }
      const fields = [...state.schema.fields]
      fields.splice(action.index, 0, fieldToAdd)
      return {
        ...state,
        selectedFieldId: action.field.id,
        schema: { ...state.schema, fields },
      }
    }

    case 'REMOVE_FIELD': {
      const fields = removeFieldById(state.schema.fields, action.fieldId)
      return {
        ...state,
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        schema: { ...state.schema, fields },
      }
    }

    case 'MOVE_FIELD': {
      const { fields: afterRemove, removed } = removeFieldFromTree(
        state.schema.fields,
        action.fromParentId,
        action.fromIndex,
      )
      if (!removed) return state
      const adjustedToIndex = action.fromIndex < action.toIndex
        ? action.toIndex - 1
        : action.toIndex
      let movedField = removed
      if (action.columnIndex !== undefined) {
        movedField = { ...movedField, columnIndex: action.columnIndex }
      }
      if (action.regionKey !== undefined) {
        movedField = { ...movedField, regionKey: action.regionKey }
      }
      // 移出 region 容器时清空 regionKey 和 columnIndex
      if (!action.toParentId) {
        if (movedField.regionKey !== undefined) {
          movedField = { ...movedField, regionKey: undefined }
        }
        if (movedField.columnIndex !== undefined) {
          movedField = { ...movedField, columnIndex: undefined }
        }
      }
      const fields = insertIntoTree(afterRemove, action.toParentId, adjustedToIndex, movedField)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'COPY_FIELD': {
      const field = findInTree(state.schema.fields, action.fieldId)
      if (!field) return state
      const copy = cloneField(field)
      const fields = insertAfter(state.schema.fields, action.fieldId, copy)
      return { ...state, schema: { ...state.schema, fields }, selectedFieldId: copy.id || null }
    }

    case 'UPDATE_FIELD': {
      if (action.patch.name) {
        const allNames = collectFieldNames(state.schema.fields, action.fieldId)
        if (allNames.has(action.patch.name)) {
          return state
        }
      }
      const fields = updateFieldInTree(state.schema.fields, action.fieldId, action.patch)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'UPDATE_FORM_CONFIG':
      return {
        ...state,
        schema: { ...state.schema, form: { ...state.schema.form, ...action.patch } },
      }

    case 'SET_SCHEMA': {
      const stillExists = state.selectedFieldId ? !!findInTree(action.schema.fields, state.selectedFieldId) : false
      return {
        ...state,
        schema: action.schema,
        selectedFieldId: stillExists ? state.selectedFieldId : null,
      }
    }

    case 'REORDER_FIELDS': {
      return { ...state, schema: { ...state.schema, fields: action.fields } }
    }

    default:
      return state
  }
}

export function designerReducerWithHistory(
  state: DesignerStateWithHistory,
  action: DesignerAction,
): DesignerStateWithHistory {
  if (action.type === 'UNDO') {
    const idx = Math.max(state.historyIndex - 1, 0)
    const fields = state.snapshots[idx] || []
    return {
      ...state,
      historyIndex: idx,
      schema: { ...state.schema, fields },
    }
  }

  if (action.type === 'REDO') {
    const idx = Math.min(state.historyIndex + 1, state.snapshots.length - 1)
    const fields = state.snapshots[idx] || []
    return {
      ...state,
      historyIndex: idx,
      schema: { ...state.schema, fields },
    }
  }

  const next = designerReducer(state, action)

  if (shouldSnapshot(action)) {
    const trimmed = state.snapshots.slice(0, state.historyIndex + 1)
    const nextSnapshots = [...trimmed, cloneFields(next.schema.fields)]
    if (nextSnapshots.length > MAX_SNAPSHOTS) nextSnapshots.shift()
    return {
      ...next,
      snapshots: nextSnapshots,
      historyIndex: nextSnapshots.length - 1,
    }
  }

  return {
    ...next,
    snapshots: state.snapshots,
    historyIndex: state.historyIndex,
  }
}