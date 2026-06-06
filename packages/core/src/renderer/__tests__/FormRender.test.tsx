import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { FormEngineAdapter, FormFieldSchema, FormSchema } from '../../types'
import { FormRender } from '../FormRender'

const createTextField = (overrides: Partial<FormFieldSchema> = {}): FormFieldSchema => ({
  id: `field_${Math.random().toString(36).slice(2, 8)}`,
  type: 'input',
  name: 'test',
  label: '测试字段',
  children: [],
  ...overrides,
})

const mockAdapter: FormEngineAdapter = {
  name: 'mock',
  scene: 'desktop',
  components: {
    input: () => React.createElement('input', { name: 'test' }),
  },
  default: () => React.createElement('div', null, '未知字段'),
}

describe('FormRender — 回归基线', () => {
  const baseSchema: FormSchema = {
    form: {
      colon: true,
      size: 'middle',
      desktop: {
        layout: 'horizontal',
        labelAlign: 'right',
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
      },
      mobile: {
        layout: 'vertical',
      },
    },
    fields: [createTextField({ name: 'name', label: '姓名' }), createTextField({ name: 'email', label: '邮箱' })],
  }

  it('渲染所有可见字段', () => {
    render(<FormRender schema={baseSchema} desktopAdapter={mockAdapter} />)
    expect(screen.getByText('姓名：')).toBeTruthy()
    expect(screen.getByText('邮箱：')).toBeTruthy()
  })

  it('过滤 hidden=true 的字段', () => {
    const schema: FormSchema = {
      ...baseSchema,
      fields: [
        createTextField({ name: 'name', label: '姓名' }),
        createTextField({ name: 'hiddenField', label: '隐藏字段', hidden: true }),
      ],
    }
    render(<FormRender schema={schema} desktopAdapter={mockAdapter} />)
    expect(screen.getByText('姓名：')).toBeTruthy()
    expect(screen.queryByText('隐藏字段：')).toBeNull()
  })

  it('通过 forwardRef 暴露 submit/reset/validate', () => {
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    render(<FormRender schema={baseSchema} desktopAdapter={mockAdapter} ref={ref} />)
    expect(ref.current).toBeDefined()
    expect(typeof ref.current!.submit).toBe('function')
    expect(typeof ref.current!.reset).toBe('function')
    expect(typeof ref.current!.validate).toBe('function')
  })

  it('提交时触发 onSubmit', () => {
    const onSubmit = vi.fn()
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    render(<FormRender schema={baseSchema} desktopAdapter={mockAdapter} onSubmit={onSubmit} ref={ref} />)
    ref.current!.submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('重置恢复初始值', () => {
    const onChange = vi.fn()
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    render(
      <FormRender
        schema={baseSchema}
        desktopAdapter={mockAdapter}
        initialValues={{ name: '初始值' }}
        onChange={onChange}
        ref={ref}
      />,
    )
    ref.current!.reset()
    expect(onChange).toHaveBeenCalledWith({ name: '初始值', email: undefined })
  })

  it('校验失败时设 fieldErrors 且不提交', () => {
    const onSubmit = vi.fn()
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    const schema: FormSchema = {
      ...baseSchema,
      fields: [createTextField({ name: 'name', label: '姓名', rules: [{ required: true, message: '请输入姓名' }] })],
    }
    render(<FormRender schema={schema} desktopAdapter={mockAdapter} onSubmit={onSubmit} ref={ref} />)
    ref.current!.submit()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('校验通过时提交并清除 errors', () => {
    const onSubmit = vi.fn()
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    render(
      <FormRender
        schema={baseSchema}
        desktopAdapter={mockAdapter}
        initialValues={{ name: 'test', email: 'test@test.com' }}
        onSubmit={onSubmit}
        ref={ref}
      />,
    )
    ref.current!.submit()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('校验方法返回正确布尔值', async () => {
    const ref = React.createRef<{ submit(): void; reset(): void; validate(name?: string): Promise<boolean> }>()
    const schema: FormSchema = {
      ...baseSchema,
      fields: [createTextField({ name: 'name', label: '姓名', rules: [{ required: true, message: '请输入姓名' }] })],
    }
    render(<FormRender schema={schema} desktopAdapter={mockAdapter} ref={ref} />)
    const valid = await ref.current!.validate()
    expect(valid).toBe(false)
  })
})
