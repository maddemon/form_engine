import { renderHook } from '@testing-library/react'
import { useVisibility } from '../useVisibility'
import type { FormSchema, FormFieldSchema } from '../../../types/schema'

const createField = (overrides: Partial<FormFieldSchema>): FormFieldSchema => ({
  type: 'input',
  name: 'test',
  label: '测试',
  ...overrides,
})

const createSchema = (fields: FormFieldSchema[]): FormSchema => ({
  form: { colon: false, labelAlign: 'right', scenes: { desktop: { labelCol: { span: 6 }, wrapperCol: { span: 18 } }, mobile: { labelCol: { span: 24 }, wrapperCol: { span: 24 } } } },
  fields,
})

describe('useVisibility', () => {
  it('默认所有字段可见', () => {
    const schema = createSchema([createField({ name: 'a' }), createField({ name: 'b' })])
    const { result } = renderHook(() => useVisibility(schema, {}))
    expect(result.current.visibleFields).toHaveLength(2)
  })

  it('hidden=true 隐藏字段', () => {
    const schema = createSchema([createField({ name: 'a' }), createField({ name: 'b', hidden: true })])
    const { result } = renderHook(() => useVisibility(schema, {}))
    expect(result.current.visibleFields).toHaveLength(1)
    expect(result.current.visibleFields[0].name).toBe('a')
  })

  it('hidden 表达式控制可见性', () => {
    const schema = createSchema([createField({ name: 'a', hidden: 'role === "admin"' })])
    const { result: visible } = renderHook(() => useVisibility(schema, { role: 'admin' }))
    expect(visible.current.visibleFields).toHaveLength(0)

    const { result: notVisible } = renderHook(() => useVisibility(schema, { role: 'user' }))
    expect(notVisible.current.visibleFields).toHaveLength(1)
  })

  it('visibleIfExpr 控制可见性', () => {
    const schema = createSchema([createField({ name: 'a', visibleIfExpr: 'age >= 18' })])
    const { result: visible } = renderHook(() => useVisibility(schema, { age: 20 }))
    expect(visible.current.visibleFields).toHaveLength(1)

    const { result: notVisible } = renderHook(() => useVisibility(schema, { age: 15 }))
    expect(notVisible.current.visibleFields).toHaveLength(0)
  })

  it('visibleWhen 规则匹配', () => {
    const schema = createSchema([createField({ name: 'a', visibleWhen: { type: 'internal' } })])
    const { result: visible } = renderHook(() => useVisibility(schema, { type: 'internal' }))
    expect(visible.current.visibleFields).toHaveLength(1)

    const { result: notVisible } = renderHook(() => useVisibility(schema, { type: 'external' }))
    expect(notVisible.current.visibleFields).toHaveLength(0)
  })

  it('formValues 变化时重新计算', () => {
    const schema = createSchema([createField({ name: 'a', visibleIfExpr: 'show === true' })])
    const { result, rerender } = renderHook(
      (values: Record<string, unknown>) => useVisibility(schema, values),
      { initialProps: { show: false } },
    )
    expect(result.current.visibleFields).toHaveLength(0)

    rerender({ show: true })
    expect(result.current.visibleFields).toHaveLength(1)
  })
})
