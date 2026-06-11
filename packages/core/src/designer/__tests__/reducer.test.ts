import { describe, expect, it } from 'vitest'
import type { FormFieldSchema, FormSchema } from '../../types/schema'
import type { DesignerState, DesignerStateWithHistory } from '../reducer'
import {
  buildFieldIndex,
  collectFieldNames,
  designerReducer,
  designerReducerWithHistory,
  findInTree,
} from '../reducer'

// ── Helpers ──────────────────────────────────────────────────────

function makeField(overrides: Partial<FormFieldSchema> = {}): FormFieldSchema {
  return {
    id: overrides.id ?? `field_${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name ?? `field_${Math.random().toString(36).slice(2, 8)}`,
    type: overrides.type ?? 'input',
    children: overrides.children ?? [],
    ...overrides,
  }
}

function makeSchema(fields: FormFieldSchema[] = []): FormSchema {
  return {
    form: {
      colon: true,
      size: 'middle',
      desktop: { layout: 'horizontal', labelAlign: 'right', labelCol: { span: 6 }, wrapperCol: { span: 18 } },
      mobile: { layout: 'vertical' },
    },
    fields,
  }
}

function makeState(fields: FormFieldSchema[] = []): DesignerState {
  return { schema: makeSchema(fields), selectedFieldId: null }
}

function makeStateWithHistory(fields: FormFieldSchema[] = []): DesignerStateWithHistory {
  return {
    schema: makeSchema(fields),
    selectedFieldId: null,
    snapshots: [fields.map(f => ({ ...f }))],
    historyIndex: 0,
  }
}

// ── SELECT_FIELD ─────────────────────────────────────────────────

describe('SELECT_FIELD', () => {
  it('selects a field', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    const next = designerReducer(state, { type: 'SELECT_FIELD', fieldId: 'f1' })
    expect(next.selectedFieldId).toBe('f1')
  })

  it('deselects when fieldId is null', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    state.selectedFieldId = 'f1'
    const next = designerReducer(state, { type: 'SELECT_FIELD', fieldId: null })
    expect(next.selectedFieldId).toBeNull()
  })
})

// ── ADD_FIELD ────────────────────────────────────────────────────

describe('ADD_FIELD', () => {
  it('adds field at root level', () => {
    const f1 = makeField({ id: 'f1' })
    const newField = makeField({ id: 'new' })
    const state = makeState([f1])
    const next = designerReducer(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 1,
    })
    expect(next.schema.fields).toHaveLength(2)
    expect(next.schema.fields[1].id).toBe('new')
    expect(next.selectedFieldId).toBe('new')
  })

  it('adds field at specific index', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const newField = makeField({ id: 'new' })
    const state = makeState([f1, f2])
    const next = designerReducer(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 0,
    })
    expect(next.schema.fields[0].id).toBe('new')
  })

  it('adds field to parent container', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const newField = makeField({ id: 'new' })
    const state = makeState([parent])
    const next = designerReducer(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 1,
      parentId: 'parent',
    })
    expect(next.schema.fields[0].children).toHaveLength(2)
    expect(next.schema.fields[0].children[1].id).toBe('new')
  })

  it('adds field with columnIndex', () => {
    const newField = makeField({ id: 'new' })
    const state = makeState([])
    const next = designerReducer(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 0,
      columnIndex: 2,
    })
    expect(next.schema.fields[0].columnIndex).toBe(2)
  })

  it('adds field with regionKey', () => {
    const newField = makeField({ id: 'new' })
    const state = makeState([])
    const next = designerReducer(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 0,
      regionKey: 'tab1',
    })
    expect(next.schema.fields[0].regionKey).toBe('tab1')
  })
})

// ── REMOVE_FIELD ─────────────────────────────────────────────────

describe('REMOVE_FIELD', () => {
  it('removes field at root level', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeState([f1, f2])
    const next = designerReducer(state, { type: 'REMOVE_FIELD', fieldId: 'f1' })
    expect(next.schema.fields).toHaveLength(1)
    expect(next.schema.fields[0].id).toBe('f2')
  })

  it('removes nested field', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const state = makeState([parent])
    const next = designerReducer(state, { type: 'REMOVE_FIELD', fieldId: 'child' })
    expect(next.schema.fields[0].children).toHaveLength(0)
  })

  it('clears selection when selected field is removed', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    state.selectedFieldId = 'f1'
    const next = designerReducer(state, { type: 'REMOVE_FIELD', fieldId: 'f1' })
    expect(next.selectedFieldId).toBeNull()
  })

  it('keeps selection when other field is removed', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeState([f1, f2])
    state.selectedFieldId = 'f1'
    const next = designerReducer(state, { type: 'REMOVE_FIELD', fieldId: 'f2' })
    expect(next.selectedFieldId).toBe('f1')
  })
})

// ── MOVE_FIELD ───────────────────────────────────────────────────

describe('MOVE_FIELD', () => {
  it('moves field within same parent', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const f3 = makeField({ id: 'f3' })
    const state = makeState([f1, f2, f3])
    const next = designerReducer(state, {
      type: 'MOVE_FIELD',
      fromIndex: 0,
      toIndex: 2,
    })
    expect(next.schema.fields.map(f => f.id)).toEqual(['f2', 'f1', 'f3'])
  })

  it('moves field to parent container', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [] })
    const state = makeState([child, parent])
    const next = designerReducer(state, {
      type: 'MOVE_FIELD',
      fromIndex: 0,
      toIndex: 0,
      toParentId: 'parent',
    })
    expect(next.schema.fields).toHaveLength(1)
    expect(next.schema.fields[0].id).toBe('parent')
    expect(next.schema.fields[0].children).toHaveLength(1)
    expect(next.schema.fields[0].children[0].id).toBe('child')
  })

  it('clears columnIndex when moving to root', () => {
    const child = makeField({ id: 'child', columnIndex: 2 })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const state = makeState([parent])
    const next = designerReducer(state, {
      type: 'MOVE_FIELD',
      fromIndex: 0,
      toIndex: 0,
      fromParentId: 'parent',
    })
    expect(next.schema.fields[0].columnIndex).toBeUndefined()
  })

  it('clears regionKey when moving to root', () => {
    const child = makeField({ id: 'child', regionKey: 'tab1' })
    const parent = makeField({ id: 'parent', type: 'tabs', children: [child] })
    const state = makeState([parent])
    const next = designerReducer(state, {
      type: 'MOVE_FIELD',
      fromIndex: 0,
      toIndex: 0,
      fromParentId: 'parent',
    })
    expect(next.schema.fields[0].regionKey).toBeUndefined()
  })
})

// ── COPY_FIELD ───────────────────────────────────────────────────

describe('COPY_FIELD', () => {
  it('copies field after original', () => {
    const f1 = makeField({ id: 'f1', name: 'field1' })
    const state = makeState([f1])
    const next = designerReducer(state, { type: 'COPY_FIELD', fieldId: 'f1' })
    expect(next.schema.fields).toHaveLength(2)
    expect(next.schema.fields[0].id).toBe('f1')
    expect(next.schema.fields[1].id).not.toBe('f1')
    expect(next.schema.fields[1].name).toBe('field1')
    expect(next.selectedFieldId).toBe(next.schema.fields[1].id)
  })

  it('returns same state when field not found', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    const next = designerReducer(state, { type: 'COPY_FIELD', fieldId: 'nonexistent' })
    expect(next).toBe(state)
  })
})

// ── UPDATE_FIELD ─────────────────────────────────────────────────

describe('UPDATE_FIELD', () => {
  it('updates field properties', () => {
    const f1 = makeField({ id: 'f1', label: 'old' })
    const state = makeState([f1])
    const next = designerReducer(state, {
      type: 'UPDATE_FIELD',
      fieldId: 'f1',
      patch: { label: 'new' },
    })
    expect(next.schema.fields[0].label).toBe('new')
  })

  it('rejects duplicate name', () => {
    const f1 = makeField({ id: 'f1', name: 'name1' })
    const f2 = makeField({ id: 'f2', name: 'name2' })
    const state = makeState([f1, f2])
    const next = designerReducer(state, {
      type: 'UPDATE_FIELD',
      fieldId: 'f1',
      patch: { name: 'name2' },
    })
    expect(next).toBe(state)
  })

  it('allows same name on same field', () => {
    const f1 = makeField({ id: 'f1', name: 'name1' })
    const state = makeState([f1])
    const next = designerReducer(state, {
      type: 'UPDATE_FIELD',
      fieldId: 'f1',
      patch: { name: 'name1' },
    })
    expect(next.schema.fields[0].name).toBe('name1')
  })

  it('updates nested field', () => {
    const child = makeField({ id: 'child', label: 'old' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const state = makeState([parent])
    const next = designerReducer(state, {
      type: 'UPDATE_FIELD',
      fieldId: 'child',
      patch: { label: 'new' },
    })
    expect(next.schema.fields[0].children[0].label).toBe('new')
  })
})

// ── UPDATE_FORM_CONFIG ───────────────────────────────────────────

describe('UPDATE_FORM_CONFIG', () => {
  it('updates form config', () => {
    const state = makeState([])
    const next = designerReducer(state, {
      type: 'UPDATE_FORM_CONFIG',
      patch: { colon: false },
    })
    expect(next.schema.form.colon).toBe(false)
  })
})

// ── SET_SCHEMA ───────────────────────────────────────────────────

describe('SET_SCHEMA', () => {
  it('replaces schema', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    const newSchema = makeSchema([makeField({ id: 'f2' })])
    const next = designerReducer(state, { type: 'SET_SCHEMA', schema: newSchema })
    expect(next.schema.fields).toHaveLength(1)
    expect(next.schema.fields[0].id).toBe('f2')
  })

  it('clears selection when selected field not in new schema', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    state.selectedFieldId = 'f1'
    const newSchema = makeSchema([makeField({ id: 'f2' })])
    const next = designerReducer(state, { type: 'SET_SCHEMA', schema: newSchema })
    expect(next.selectedFieldId).toBeNull()
  })

  it('keeps selection when selected field exists in new schema', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeState([f1])
    state.selectedFieldId = 'f1'
    const newSchema = makeSchema([makeField({ id: 'f1' })])
    const next = designerReducer(state, { type: 'SET_SCHEMA', schema: newSchema })
    expect(next.selectedFieldId).toBe('f1')
  })
})

// ── REORDER_FIELDS ───────────────────────────────────────────────

describe('REORDER_FIELDS', () => {
  it('replaces fields with new order', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeState([f1, f2])
    const next = designerReducer(state, {
      type: 'REORDER_FIELDS',
      fields: [f2, f1],
    })
    expect(next.schema.fields.map(f => f.id)).toEqual(['f2', 'f1'])
  })
})

// ── designerReducerWithHistory (UNDO/REDO) ───────────────────────

describe('designerReducerWithHistory', () => {
  it('undo reverts to previous snapshot', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeStateWithHistory([f1])
    state.snapshots = [[{ ...f1 }], [{ ...f1 }, { ...f2 }]]
    state.historyIndex = 1
    const next = designerReducerWithHistory(state, { type: 'UNDO' })
    expect(next.historyIndex).toBe(0)
    expect(next.schema.fields).toHaveLength(1)
  })

  it('redo advances to next snapshot', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeStateWithHistory([f1, f2])
    state.snapshots = [[{ ...f1 }], [{ ...f1 }, { ...f2 }]]
    state.historyIndex = 0
    const next = designerReducerWithHistory(state, { type: 'REDO' })
    expect(next.historyIndex).toBe(1)
    expect(next.schema.fields).toHaveLength(2)
  })

  it('undo at index 0 stays at 0', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeStateWithHistory([f1])
    state.snapshots = [[{ ...f1 }]]
    state.historyIndex = 0
    const next = designerReducerWithHistory(state, { type: 'UNDO' })
    expect(next.historyIndex).toBe(0)
  })

  it('redo at last index stays at last', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeStateWithHistory([f1])
    state.snapshots = [[{ ...f1 }]]
    state.historyIndex = 0
    const next = designerReducerWithHistory(state, { type: 'REDO' })
    expect(next.historyIndex).toBe(0)
  })

  it('ADD_FIELD creates snapshot', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeStateWithHistory([f1])
    const newField = makeField({ id: 'new' })
    const next = designerReducerWithHistory(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 1,
    })
    expect(next.snapshots).toHaveLength(2)
    expect(next.historyIndex).toBe(1)
  })

  it('REMOVE_FIELD creates snapshot', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const state = makeStateWithHistory([f1, f2])
    const next = designerReducerWithHistory(state, { type: 'REMOVE_FIELD', fieldId: 'f1' })
    expect(next.snapshots).toHaveLength(2)
  })

  it('UPDATE_FIELD creates snapshot', () => {
    const f1 = makeField({ id: 'f1', label: 'old' })
    const state = makeStateWithHistory([f1])
    const next = designerReducerWithHistory(state, {
      type: 'UPDATE_FIELD',
      fieldId: 'f1',
      patch: { label: 'new' },
    })
    expect(next.snapshots).toHaveLength(2)
  })

  it('SELECT_FIELD does not create snapshot', () => {
    const f1 = makeField({ id: 'f1' })
    const state = makeStateWithHistory([f1])
    const next = designerReducerWithHistory(state, { type: 'SELECT_FIELD', fieldId: 'f1' })
    expect(next.snapshots).toHaveLength(1)
  })

  it('trims future snapshots on new action after undo', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const f3 = makeField({ id: 'f3' })
    const state = makeStateWithHistory([f1, f2])
    state.snapshots = [
      [{ ...f1 }],
      [{ ...f1 }, { ...f2 }],
      [{ ...f1 }, { ...f2 }, { ...f3 }],
    ]
    state.historyIndex = 1
    const newField = makeField({ id: 'new' })
    const next = designerReducerWithHistory(state, {
      type: 'ADD_FIELD',
      field: newField,
      index: 0,
    })
    expect(next.snapshots).toHaveLength(3)
    expect(next.historyIndex).toBe(2)
  })
})

// ── buildFieldIndex ──────────────────────────────────────────────

describe('buildFieldIndex', () => {
  it('indexes root fields', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const index = buildFieldIndex([f1, f2])
    expect(index.size).toBe(2)
    expect(index.get('f1')?.parentId).toBeNull()
    expect(index.get('f1')?.index).toBe(0)
    expect(index.get('f2')?.index).toBe(1)
  })

  it('indexes nested fields', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const index = buildFieldIndex([parent])
    expect(index.size).toBe(2)
    expect(index.get('child')?.parentId).toBe('parent')
    expect(index.get('child')?.path).toEqual(['parent', 'child'])
  })

  it('skips fields without id', () => {
    const f1 = makeField({ id: '' })
    const index = buildFieldIndex([f1])
    expect(index.size).toBe(0)
  })
})

// ── findInTree ───────────────────────────────────────────────────

describe('findInTree', () => {
  it('finds root field', () => {
    const f1 = makeField({ id: 'f1' })
    const result = findInTree([f1], 'f1')
    expect(result?.id).toBe('f1')
  })

  it('finds nested field', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const result = findInTree([parent], 'child')
    expect(result?.id).toBe('child')
  })

  it('returns undefined for nonexistent field', () => {
    const f1 = makeField({ id: 'f1' })
    const result = findInTree([f1], 'nonexistent')
    expect(result).toBeUndefined()
  })
})

// ── collectFieldNames ────────────────────────────────────────────

describe('collectFieldNames', () => {
  it('collects names from all fields', () => {
    const f1 = makeField({ id: 'f1', name: 'name1' })
    const f2 = makeField({ id: 'f2', name: 'name2' })
    const names = collectFieldNames([f1, f2], '')
    expect(names).toEqual(new Set(['name1', 'name2']))
  })

  it('excludes specified field id', () => {
    const f1 = makeField({ id: 'f1', name: 'name1' })
    const f2 = makeField({ id: 'f2', name: 'name2' })
    const names = collectFieldNames([f1, f2], 'f1')
    expect(names).toEqual(new Set(['name2']))
  })

  it('collects names from nested fields', () => {
    const child = makeField({ id: 'child', name: 'childName' })
    const parent = makeField({ id: 'parent', type: 'grid', name: 'parentName', children: [child] })
    const names = collectFieldNames([parent], '')
    expect(names).toEqual(new Set(['parentName', 'childName']))
  })
})
