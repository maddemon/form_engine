import { describe, expect, it } from 'vitest'
import type { FormFieldSchema } from '../../../types/schema'
import { buildFieldIndex } from '../../reducer'
import { findFieldPosition, isAncestorOfByIndex, reorderFieldsInContainer, resolveDropTarget } from '../positionResolver'

function makeField(overrides: Partial<FormFieldSchema> = {}): FormFieldSchema {
  return {
    id: overrides.id ?? `field_${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name ?? `field_${Math.random().toString(36).slice(2, 8)}`,
    type: overrides.type ?? 'input',
    children: overrides.children ?? [],
    ...overrides,
  }
}

// ── findFieldPosition ──────────────────────────────────────────────

describe('findFieldPosition', () => {
  it('finds root field', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const pos = findFieldPosition([f1, f2], 'f1')
    expect(pos).toEqual({ parentId: undefined, index: 0, regionKey: undefined })
  })

  it('finds nested field', () => {
    const child = makeField({ id: 'child' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
    const pos = findFieldPosition([parent], 'child')
    expect(pos).toEqual({ parentId: 'parent', index: 0, regionKey: undefined })
  })

  it('returns null for nonexistent field', () => {
    const f1 = makeField({ id: 'f1' })
    const pos = findFieldPosition([f1], 'nonexistent')
    expect(pos).toBeNull()
  })
})

// ── resolveDropTarget ──────────────────────────────────────────────

describe('resolveDropTarget', () => {
  const f1 = makeField({ id: 'f1' })
  const f2 = makeField({ id: 'f2' })
  const child = makeField({ id: 'child' })
  const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
  const fields = [f1, f2, parent]
  const fieldIndex = buildFieldIndex(fields)

  it('resolves canvas root head', () => {
    const result = resolveDropTarget('canvas-root-head', fields, fieldIndex)
    expect(result).toEqual({ parentId: undefined, index: 0 })
  })

  it('resolves canvas root', () => {
    const result = resolveDropTarget('canvas-root', fields, fieldIndex)
    expect(result).toEqual({ parentId: undefined, index: 3 })
  })

  it('resolves container', () => {
    const result = resolveDropTarget('parent__container', fields, fieldIndex)
    expect(result).toEqual({ parentId: 'parent', index: 1 })
  })

  it('resolves region', () => {
    const result = resolveDropTarget('parent__region_tab1', fields, fieldIndex)
    expect(result).toEqual({ parentId: 'parent', index: 1, regionKey: 'tab1' })
  })

  it('resolves field', () => {
    const result = resolveDropTarget('f1', fields, fieldIndex)
    expect(result).toEqual({ parentId: undefined, index: 1, regionKey: undefined })
  })
})

// ── reorderFieldsInContainer ───────────────────────────────────────

describe('reorderFieldsInContainer', () => {
  it('reorders root fields', () => {
    const f1 = makeField({ id: 'f1' })
    const f2 = makeField({ id: 'f2' })
    const f3 = makeField({ id: 'f3' })
    const result = reorderFieldsInContainer([f1, f2, f3], undefined, 0, 2)
    expect(result.map(f => f.id)).toEqual(['f2', 'f3', 'f1'])
  })

  it('reorders container children', () => {
    const child1 = makeField({ id: 'c1' })
    const child2 = makeField({ id: 'c2' })
    const parent = makeField({ id: 'parent', type: 'grid', children: [child1, child2] })
    const result = reorderFieldsInContainer([parent], 'parent', 0, 1)
    expect(result[0].children.map(f => f.id)).toEqual(['c2', 'c1'])
  })
})

// ── isAncestorOfByIndex ────────────────────────────────────────────

describe('isAncestorOfByIndex', () => {
  const child = makeField({ id: 'child' })
  const parent = makeField({ id: 'parent', type: 'grid', children: [child] })
  const fields = [parent]
  const fieldIndex = buildFieldIndex(fields)

  it('returns true for self', () => {
    expect(isAncestorOfByIndex(fieldIndex, 'parent', 'parent')).toBe(true)
  })

  it('returns true for ancestor', () => {
    expect(isAncestorOfByIndex(fieldIndex, 'parent', 'child')).toBe(true)
  })

  it('returns false for non-ancestor', () => {
    const f1 = makeField({ id: 'f1' })
    const idx = buildFieldIndex([f1])
    expect(isAncestorOfByIndex(idx, 'parent', 'f1')).toBe(false)
  })

  it('returns false for nonexistent field', () => {
    expect(isAncestorOfByIndex(fieldIndex, 'parent', 'nonexistent')).toBe(false)
  })
})
