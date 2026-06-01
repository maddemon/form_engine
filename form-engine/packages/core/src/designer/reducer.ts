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
  return ['ADD_FIELD', 'REMOVE_FIELD', 'MOVE_FIELD', 'UPDATE_FIELD'].includes(action.type)
}

function cloneFields(fields: FormFieldSchema[]): FormFieldSchema[] {
  return structuredClone(fields)
}

export function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId }

    case 'ADD_FIELD': {
      const fields = [...state.schema.fields]
      fields.splice(action.index, 0, action.field)
      return {
        ...state,
        selectedFieldId: action.field.id!,
        schema: { ...state.schema, fields },
      }
    }

    case 'REMOVE_FIELD': {
      const fields = state.schema.fields.filter((f) => f.id !== action.fieldId)
      return {
        ...state,
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        schema: { ...state.schema, fields },
      }
    }

    case 'MOVE_FIELD': {
      const fields = [...state.schema.fields]
      const [moved] = fields.splice(action.fromIndex, 1)
      fields.splice(action.toIndex, 0, moved)
      return { ...state, schema: { ...state.schema, fields } }
    }

    case 'UPDATE_FIELD': {
      const fields = state.schema.fields.map((f) =>
        f.id === action.fieldId ? { ...f, ...action.patch } : f,
      )
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
      const stillExists = action.schema.fields.some((f) => f.id === state.selectedFieldId)
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
