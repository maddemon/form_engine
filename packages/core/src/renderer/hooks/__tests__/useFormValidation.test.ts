import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FormFieldSchema } from '../../../types/schema'
import { useFormValidation } from '../useFormValidation'

describe('useFormValidation', () => {
  it('初始状态为空', () => {
    const { result } = renderHook(() => useFormValidation())
    expect(result.current.fieldErrors).toEqual({})
    expect(result.current.fieldOptions).toEqual({})
  })

  it('clearFieldError 清除指定字段错误', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => result.current.setFieldErrors({ name: ['错误'], email: ['错误'] }))
    act(() => result.current.clearFieldError('name'))
    expect(result.current.fieldErrors).toEqual({ email: ['错误'] })
  })

  it('clearFieldError 字段无错误时不操作', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => result.current.setFieldErrors({ name: ['错误'] }))
    act(() => result.current.clearFieldError('unknown'))
    expect(result.current.fieldErrors).toEqual({ name: ['错误'] })
  })

  it('clearAllErrors 清除全部错误', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => result.current.setFieldErrors({ a: ['err1'], b: ['err2'] }))
    act(() => result.current.clearAllErrors())
    expect(result.current.fieldErrors).toEqual({})
  })

  it('validate 返回 boolean', async () => {
    const { result } = renderHook(() => useFormValidation())
    const fields: FormFieldSchema[] = [
      {
        id: 'field_1',
        type: 'input',
        name: 'name',
        label: '姓名',
        children: [],
        rules: [{ required: true, message: '必填' }],
      },
    ]
    const valid = await result.current.validate(fields, {})
    expect(valid).toBe(false)

    const valid2 = await result.current.validate(fields, { name: 'test' })
    expect(valid2).toBe(true)
  })

  it('validate 不传 name 校验全部字段', async () => {
    const { result } = renderHook(() => useFormValidation())
    const fields: FormFieldSchema[] = [
      {
        id: 'field_a',
        type: 'input',
        name: 'a',
        label: 'A',
        children: [],
        rules: [{ required: true, message: '必填' }],
      },
      { id: 'field_b', type: 'input', name: 'b', label: 'B', children: [] },
    ]
    const valid = await result.current.validate(fields, { a: 'x' })
    expect(valid).toBe(true)
  })

  it('validateRaw 返回完整 ValidateResult', async () => {
    const { result } = renderHook(() => useFormValidation())
    const fields: FormFieldSchema[] = [
      {
        id: 'field_2',
        type: 'input',
        name: 'name',
        label: '姓名',
        children: [],
        rules: [{ required: true, message: '必填' }],
      },
    ]
    const res = await result.current.validateRaw(fields, {})
    expect(res.valid).toBe(false)
    expect(res.errors).toEqual({ name: ['必填'] })
  })

  it('setFieldOptions 设置选项', () => {
    const { result } = renderHook(() => useFormValidation())
    act(() => result.current.setFieldOptions({ city: [{ label: '北京', value: 'beijing' }] }))
    expect(result.current.fieldOptions).toEqual({ city: [{ label: '北京', value: 'beijing' }] })
  })
})
