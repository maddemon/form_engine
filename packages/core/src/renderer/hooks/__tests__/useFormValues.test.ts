import { renderHook, act } from '@testing-library/react'
import { useFormValues } from '../useFormValues'
import { vi } from 'vitest'

describe('useFormValues', () => {
  it('用初始值初始化', () => {
    const { result } = renderHook(() => useFormValues({ initialValues: { name: 'test' } }))
    expect(result.current.formValues).toEqual({ name: 'test' })
  })

  it('setFieldValue 合并值', () => {
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { a: 1, b: 2 } })
    )
    act(() => result.current.setFieldValue('a', 10))
    expect(result.current.formValues).toEqual({ a: 10, b: 2 })
  })

  it('setFieldsValue 批量设值', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { a: 1, b: 2 }, onChange })
    )
    act(() => result.current.setFieldsValue({ a: 10, c: 3 }))
    expect(result.current.formValues).toEqual({ a: 10, b: 2, c: 3 })
    expect(onChange).toHaveBeenCalledWith({ a: 10, b: 2, c: 3 })
  })

  it('getFieldValue 取单字段值', () => {
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { name: 'test' } })
    )
    expect(result.current.getFieldValue('name')).toBe('test')
    expect(result.current.getFieldValue('unknown')).toBeUndefined()
  })

  it('reset 恢复初始值并触发 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { name: 'initial' }, onChange })
    )
    act(() => result.current.setFieldValue('name', 'changed'))
    expect(result.current.formValues).toEqual({ name: 'changed' })

    act(() => result.current.reset())
    expect(result.current.formValues).toEqual({ name: 'initial' })
    expect(onChange).toHaveBeenCalledWith({ name: 'initial' })
  })

  it('submit 调用回调', () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { name: 'test' } })
    )
    act(() => result.current.setFieldValue('name', 'submitted'))
    act(() => result.current.submit(onSubmit))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'submitted' })
  })

  it('debouncedOnChange 防抖触发 onChange', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { name: 'test' }, onChange })
    )
    act(() => result.current.debouncedOnChange())
    expect(onChange).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(300) })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({ name: 'test' })

    vi.useRealTimers()
  })

  it('formValuesRef 始终指向最新值', () => {
    const { result } = renderHook(() =>
      useFormValues({ initialValues: { name: 'initial' } })
    )
    expect(result.current.formValuesRef.current).toEqual({ name: 'initial' })

    act(() => result.current.setFieldValue('name', 'updated'))
    expect(result.current.formValuesRef.current).toEqual({ name: 'updated' })
  })

  it('submit 无回调时不报错', () => {
    const { result } = renderHook(() =>
      useFormValues({ initialValues: {} })
    )
    expect(() => result.current.submit()).not.toThrow()
  })

  it('reset 无 onChange 时不报错', () => {
    const { result } = renderHook(() =>
      useFormValues({ initialValues: {} })
    )
    expect(() => result.current.reset()).not.toThrow()
  })
})
