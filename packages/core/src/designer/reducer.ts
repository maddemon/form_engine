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
  return ['ADD_FIELD', 'REMOVE_FIELD', 'MOVE_FIELD', 'UPDATE_FIELD', 'COPY_FIELD'].includes(action.type)
}

function findFieldById(fields: FormFieldSchema[], id: string): FormFieldSchema | undefined {
  for (const f of fields) {
    if (f.id === id) return f
    if (f.children) {
      const found = findFieldById(f.children, id)
      if (found) return found
    }
  }
  return undefined
}

function insertAfter(fields: FormFieldSchema[], targetId: string, newField: FormFieldSchema): FormFieldSchema[] {
  const idx = fields.findIndex(f => f.id === targetId)
  if (idx >= 0) {
    const result = [...fields]
    result.splice(idx + 1, 0, newField)
    return result
  }
  return fields.map(f =>
    f.children ? { ...f, children: insertAfter(f.children, targetId, newField) } : f,
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
    children: field.children?.map(cloneField),
  }
}

function removeFieldFromChildren(fields: FormFieldSchema[], fieldId: string): FormFieldSchema[] {
  return fields
    .filter(f => f.id !== fieldId)
    .map(f => f.children ? { ...f, children: removeFieldFromChildren(f.children, fieldId) } : f)
}

function updateFieldInTree(fields: FormFieldSchema[], fieldId: string, patch: Partial<FormFieldSchema>): FormFieldSchema[] {
  return fields.map(f => {
    if (f.id === fieldId) return { ...f, ...patch }
    if (f.children) return { ...f, children: updateFieldInTree(f.children, fieldId, patch) }
    return f
  })
}

function cloneFields(fields: FormFieldSchema[]): FormFieldSchema[] {
  return structuredClone(fields)
}

export function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId }

    case 'ADD_FIELD': {
      if (action.parentId) {
        const addToParent = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
          nodes.map(n => {
            if (n.id === action.parentId) return { ...n, children: [...(n.children || []), action.field] }
            return n.children ? { ...n, children: addToParent(n.children) } : n
          })
        return {
          ...state,
          selectedFieldId: action.field.id!,
          schema: { ...state.schema, fields: addToParent(state.schema.fields) },
        }
      }
      const fields = [...state.schema.fields]
      fields.splice(action.index, 0, action.field)
      return {
        ...state,
        selectedFieldId: action.field.id!,
        schema: { ...state.schema, fields },
      }
    }

    case 'REMOVE_FIELD': {
      const fields = removeFieldFromChildren(state.schema.fields, action.fieldId)
      return {
        ...state,
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        schema: { ...state.schema, fields },
      }
    }

    case 'MOVE_FIELD': {
      if (action.toParentId) {
        const sourceFields = cloneFields(state.schema.fields)
        let moved: FormFieldSchema | null = null

        if (action.fromParentId) {
          const removeFromContainer = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
            nodes.map(n => {
              if (n.id === action.fromParentId && n.children) {
                moved = n.children[action.fromIndex] || null
                return { ...n, children: n.children.filter((_, i) => i !== action.fromIndex) }
              }
              return n.children ? { ...n, children: removeFromContainer(n.children) } : n
            })
          const afterRemove = removeFromContainer(sourceFields)
          if (!moved) return state
          const addToContainer = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
            nodes.map(n => {
              if (n.id === action.toParentId) return { ...n, children: [...(n.children || []), moved!] }
              return n.children ? { ...n, children: addToContainer(n.children) } : n
            })
          return { ...state, schema: { ...state.schema, fields: addToContainer(afterRemove) } }
        }

        const [removed] = sourceFields.splice(action.fromIndex, 1)
        if (!removed) return state
        moved = removed
        const addToContainer = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
          nodes.map(n => {
            if (n.id === action.toParentId) return { ...n, children: [...(n.children || []), moved!] }
            return n.children ? { ...n, children: addToContainer(n.children) } : n
          })
        return { ...state, schema: { ...state.schema, fields: addToContainer(sourceFields) } }
      }

      if (action.fromParentId) {
        const sourceFields = cloneFields(state.schema.fields)
        let moved: FormFieldSchema | null = null
        const removeFromContainer = (nodes: FormFieldSchema[]): FormFieldSchema[] =>
          nodes.map(n => {
            if (n.id === action.fromParentId && n.children) {
              moved = n.children[action.fromIndex] || null
              return { ...n, children: n.children.filter((_, i) => i !== action.fromIndex) }
            }
            return n.children ? { ...n, children: removeFromContainer(n.children) } : n
          })
        const afterRemove = removeFromContainer(sourceFields)
        if (!moved) return state
        const result = [...afterRemove]
        result.splice(action.toIndex, 0, moved)
        return { ...state, schema: { ...state.schema, fields: result } }
      }

      const fields = [...state.schema.fields]
      const [moved] = fields.splice(action.fromIndex, 1)
      fields.splice(action.toIndex, 0, moved)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'COPY_FIELD': {
      const field = findFieldById(state.schema.fields, action.fieldId)
      if (!field) return state
      const copy = cloneField(field)
      const fields = insertAfter(state.schema.fields, action.fieldId, copy)
      return { ...state, schema: { ...state.schema, fields }, selectedFieldId: copy.id || null }
    }

    case 'UPDATE_FIELD': {
      const fields = updateFieldInTree(state.schema.fields, action.fieldId, action.patch)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'UPDATE_FORM_CONFIG':
      return {
        ...state,
        schema: { ...state.schema, form: { ...state.schema.form, ...action.patch } },
      }

    case 'UPDATE_SUBMIT_CONFIG':
      return {
        ...state,
        schema: { ...state.schema, submit: { ...state.schema.submit, ...action.patch } },
      }

    case 'SET_SCHEMA': {
      const findInTree = (fields: FormFieldSchema[], id: string): boolean =>
        fields.some(f => f.id === id || (f.children && findInTree(f.children, id)))
      const stillExists = state.selectedFieldId ? findInTree(action.schema.fields, state.selectedFieldId) : false
      return {
        ...state,
        schema: action.schema,
        selectedFieldId: stillExists ? state.selectedFieldId : null,
      }
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
