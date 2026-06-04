import type { FormSchema, FormFieldSchema } from '../types/schema'
import type { DesignerAction } from '../types/designer'
import { cloneField, cloneFields, insertAfter, insertIntoTree, removeFieldById, removeFieldFromTree, updateFieldInTree } from './reducer/fieldOperations'

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

// ── Action handlers ────────────────────────────────────────────────

function handleSelectField(state: DesignerState, action: Extract<DesignerAction, { type: 'SELECT_FIELD' }>): DesignerState {
  return { ...state, selectedFieldId: action.fieldId }
}

function handleAddField(state: DesignerState, action: Extract<DesignerAction, { type: 'ADD_FIELD' }>): DesignerState {
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

function handleRemoveField(state: DesignerState, action: Extract<DesignerAction, { type: 'REMOVE_FIELD' }>): DesignerState {
  const fields = removeFieldById(state.schema.fields, action.fieldId)
  return {
    ...state,
    selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
    schema: { ...state.schema, fields },
  }
}

function handleMoveField(state: DesignerState, action: Extract<DesignerAction, { type: 'MOVE_FIELD' }>): DesignerState {
  const { fields: afterRemove, removed } = removeFieldFromTree(
    state.schema.fields,
    action.fromParentId,
    action.fromIndex,
  )
  if (!removed) return state
  const adjustedToIndex = action.fromIndex < action.toIndex ? action.toIndex - 1 : action.toIndex
  let movedField = removed
  if (action.columnIndex !== undefined) {
    movedField = { ...movedField, columnIndex: action.columnIndex }
  }
  if (action.regionKey !== undefined) {
    movedField = { ...movedField, regionKey: action.regionKey }
  }
  if (!action.toParentId) {
    if (movedField.regionKey !== undefined) movedField = { ...movedField, regionKey: undefined }
    if (movedField.columnIndex !== undefined) movedField = { ...movedField, columnIndex: undefined }
  }
  const fields = insertIntoTree(afterRemove, action.toParentId, adjustedToIndex, movedField)
  return { ...state, schema: { ...state.schema, fields } }
}

function handleCopyField(state: DesignerState, action: Extract<DesignerAction, { type: 'COPY_FIELD' }>): DesignerState {
  const field = findInTree(state.schema.fields, action.fieldId)
  if (!field) return state
  const copy = cloneField(field)
  const fields = insertAfter(state.schema.fields, action.fieldId, copy)
  return { ...state, schema: { ...state.schema, fields }, selectedFieldId: copy.id || null }
}

function handleUpdateField(state: DesignerState, action: Extract<DesignerAction, { type: 'UPDATE_FIELD' }>): DesignerState {
  if (action.patch.name) {
    const allNames = collectFieldNames(state.schema.fields, action.fieldId)
    if (allNames.has(action.patch.name)) return state
  }
  const fields = updateFieldInTree(state.schema.fields, action.fieldId, action.patch)
  return { ...state, schema: { ...state.schema, fields } }
}

function handleUpdateFormConfig(state: DesignerState, action: Extract<DesignerAction, { type: 'UPDATE_FORM_CONFIG' }>): DesignerState {
  return {
    ...state,
    schema: { ...state.schema, form: { ...state.schema.form, ...action.patch } },
  }
}

function handleSetSchema(state: DesignerState, action: Extract<DesignerAction, { type: 'SET_SCHEMA' }>): DesignerState {
  const stillExists = state.selectedFieldId ? !!findInTree(action.schema.fields, state.selectedFieldId) : false
  return {
    ...state,
    schema: action.schema,
    selectedFieldId: stillExists ? state.selectedFieldId : null,
  }
}

function handleReorderFields(state: DesignerState, action: Extract<DesignerAction, { type: 'REORDER_FIELDS' }>): DesignerState {
  return { ...state, schema: { ...state.schema, fields: action.fields } }
}

// ── Main reducer (routing dispatch) ────────────────────────────────

export function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SELECT_FIELD':     return handleSelectField(state, action)
    case 'ADD_FIELD':        return handleAddField(state, action)
    case 'REMOVE_FIELD':     return handleRemoveField(state, action)
    case 'MOVE_FIELD':       return handleMoveField(state, action)
    case 'COPY_FIELD':       return handleCopyField(state, action)
    case 'UPDATE_FIELD':     return handleUpdateField(state, action)
    case 'UPDATE_FORM_CONFIG': return handleUpdateFormConfig(state, action)
    case 'SET_SCHEMA':       return handleSetSchema(state, action)
    case 'REORDER_FIELDS':   return handleReorderFields(state, action)
    default:                 return state
  }
}

export function designerReducerWithHistory(
  state: DesignerStateWithHistory,
  action: DesignerAction,
): DesignerStateWithHistory {
  if (action.type === 'UNDO') {
    const idx = Math.max(state.historyIndex - 1, 0)
    const fields = state.snapshots[idx] || []
    return { ...state, historyIndex: idx, schema: { ...state.schema, fields } }
  }

  if (action.type === 'REDO') {
    const idx = Math.min(state.historyIndex + 1, state.snapshots.length - 1)
    const fields = state.snapshots[idx] || []
    return { ...state, historyIndex: idx, schema: { ...state.schema, fields } }
  }

  const next = designerReducer(state, action)

  if (shouldSnapshot(action)) {
    const trimmed = state.snapshots.slice(0, state.historyIndex + 1)
    const nextSnapshots = [...trimmed, cloneFields(next.schema.fields)]
    if (nextSnapshots.length > MAX_SNAPSHOTS) nextSnapshots.shift()
    return { ...next, snapshots: nextSnapshots, historyIndex: nextSnapshots.length - 1 }
  }

  return { ...next, snapshots: state.snapshots, historyIndex: state.historyIndex }
}
