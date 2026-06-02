import { describe, it } from 'node:test'
import type { $Form, $Self, EventHandler, EventDeclaration, FormFieldEvents } from '../../types/events'
import { resolveEventHandler, resolveEvents } from '../resolver'
import { getActionDef, listActionNames, invokeAction } from '../actions'

declare const expect: (value: unknown) => {
  toBe: (expected: unknown) => void
  toBeDefined: () => void
  toBeUndefined: () => void
  toBeNull: () => void
  toBeTruthy: () => void
  toBeFalsy: () => void
  toEqual: (expected: unknown) => void
  toBeGreaterThan: (expected: number) => void
  toBeLessThan: (expected: number) => void
  toContain: (expected: unknown) => void
  toMatch: (expected: string | RegExp) => void
  toThrow: (expected?: string | Error) => void
  not: {
    toBe: (expected: unknown) => void
    toBeDefined: () => void
    toBeUndefined: () => void
    toBeNull: () => void
    toBeTruthy: () => void
    toBeFalsy: () => void
    toEqual: (expected: unknown) => void
    toContain: (expected: unknown) => void
    toMatch: (expected: string | RegExp) => void
    toThrow: (expected?: string | Error) => void
  }
}

const mock$self: $Self = {
  name: 'username',
  value: 'test',
  schema: { type: 'input', name: 'username', label: '用户名' } as any,
  props: { disabled: false, readOnly: false, placeholder: '请输入' },
}

const mock$form: $Form = {
  get values() { return { username: 'test' } },
  setFieldValue: (_name: string, _value: unknown) => {},
  setFieldsValue: (_patch: Record<string, unknown>) => {},
  getFieldValue: (name: string) => (mock$form as any).values[name],
  submit: () => {},
  reset: () => {},
  validate: async (_name?: string) => true,
}

const mockCallbacks: Record<string, (...args: any[]) => void> = {
  onCustomClick: (...args: any[]) => args,
}

describe('resolveEventHandler', () => {
  it('expression 类型：应注入 $self/$form/$event 并执行表达式', () => {
    const handler: EventHandler = {
      type: 'expression',
      expression: '$self.name + "=" + $self.value',
    }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    const result = fn()
    expect(result).toBe('username=test')
  })

  it('expression 类型：$event 应从调用参数获取', () => {
    const handler: EventHandler = {
      type: 'expression',
      expression: '$event',
    }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    const result = fn('event-value')
    expect(result).toBe('event-value')
  })

  it('expression 类型：语法错误应 console.warn 并返回 undefined', () => {
    const handler: EventHandler = {
      type: 'expression',
      expression: '!!!invalid!!!<<<',
    }
    const warnSpy = (..._args: any[]) => {}
    const originalWarn = console.warn
    console.warn = warnSpy
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    const result = fn()
    console.warn = originalWarn
    expect(result).toBeUndefined()
  })

  it('action 类型：应调用 $form 对应方法', () => {
    let submitted = false
    const form = { ...mock$form, submit: () => { submitted = true } }
    const handler: EventHandler = {
      type: 'action',
      action: 'submit',
    }
    const fn = resolveEventHandler(handler, mock$self, form, undefined, {})
    fn()
    expect(submitted).toBe(true)
  })

  it('action 类型：setFieldValue 应传参', () => {
    let setKey = ''
    let setVal: unknown
    const form = { ...mock$form, setFieldValue: (n: string, v: unknown) => { setKey = n; setVal = v } }
    const handler: EventHandler = {
      type: 'action',
      action: 'setFieldValue',
      params: { name: 'other', value: 'hello' },
    }
    const fn = resolveEventHandler(handler, mock$self, form, undefined, {})
    fn()
    expect(setKey).toBe('other')
    expect(setVal).toBe('hello')
  })

  it('action 类型：未知 action 应 console.warn', () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: any[]) => { warnings.push(String(args[0])) }
    const handler: EventHandler = {
      type: 'action',
      action: 'nonexistent',
    }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    fn()
    console.warn = originalWarn
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain('未知 action')
  })

  it('callback 类型：应从 callbacks 中查找并调用', () => {
    let received: unknown[] = []
    const cbs = { myCb: (...args: unknown[]) => { received = args } }
    const handler: EventHandler = {
      type: 'callback',
      callback: 'myCb',
    }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, cbs)
    fn('arg1', 'arg2')
    expect(received.length).toBe(2)
    expect(received[0]).toBe('arg1')
    expect(received[1]).toBe('arg2')
  })

  it('callback 类型：不存在的回调应 console.warn', () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: any[]) => { warnings.push(String(args[0])) }
    const handler: EventHandler = {
      type: 'callback',
      callback: 'missingCallback',
    }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    fn()
    console.warn = originalWarn
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain('回调不存在')
  })

  it('未知 type 应返回空函数', () => {
    const handler = { type: 'unknown' as any }
    const fn = resolveEventHandler(handler, mock$self, mock$form, undefined, {})
    const result = fn()
    expect(result).toBeUndefined()
  })
})

describe('resolveEvents', () => {
  it('events 为 undefined 时返回空对象', () => {
    const result = resolveEvents(undefined, mock$self, mock$form, {})
    expect(Object.keys(result).length).toBe(0)
  })

  it('应解析所有已配置的事件', () => {
    const events: FormFieldEvents = {
      onChange: { type: 'callback', callback: 'onCustomClick' },
      onClick: { type: 'action', action: 'submit' },
    }
    const result = resolveEvents(events, mock$self, mock$form, mockCallbacks)
    expect(result.onChange).toBeDefined()
    expect(result.onClick).toBeDefined()
  })

  it('未配置的事件（值为 undefined）不应出现在结果中', () => {
    const events: FormFieldEvents = {
      onChange: { type: 'action', action: 'submit' },
    }
    const result = resolveEvents(events, mock$self, mock$form, {})
    expect(result.onChange).toBeDefined()
    expect(result.onBlur).toBeUndefined()
    expect(result.onClick).toBeUndefined()
  })

  it('同步事件（默认）应丢弃返回值', () => {
    const events: FormFieldEvents = {
      onClick: { type: 'expression', expression: '$self.value' },
    }
    const result = resolveEvents(events, mock$self, mock$form, {})
    const returnValue = result.onClick!()
    expect(returnValue).toBeUndefined()
  })

  it('异步事件（async=true）应保留返回值', () => {
    const events: FormFieldEvents = {
      beforeUpload: { type: 'expression', expression: 'true' },
    }
    const declarations: EventDeclaration[] = [
      { name: 'beforeUpload', label: '上传前', async: true },
    ]
    const result = resolveEvents(events, mock$self, mock$form, {}, declarations)
    const returnValue = result.beforeUpload!()
    expect(returnValue).toBe(true)
  })

  it('无 eventDeclarations 时所有事件均视为同步', () => {
    const events: FormFieldEvents = {
      beforeUpload: { type: 'expression', expression: 'true' },
    }
    const result = resolveEvents(events, mock$self, mock$form, {})
    const returnValue = result.beforeUpload!()
    expect(returnValue).toBeUndefined()
  })
})

describe('actions 注册表', () => {
  it('应包含 submit/reset/validate/setFieldValue', () => {
    const names = listActionNames()
    expect(names).toContain('submit')
    expect(names).toContain('reset')
    expect(names).toContain('validate')
    expect(names).toContain('setFieldValue')
  })

  it('getActionDef 应返回已注册 action 的定义', () => {
    const def = getActionDef('submit')
    expect(def).toBeDefined()
    expect(def!.name).toBe('submit')
    expect(def!.invoke).toBe('method')
  })

  it('getActionDef 对未注册 action 应返回 undefined', () => {
    const def = getActionDef('nonexistent')
    expect(def).toBeUndefined()
  })

  it('invokeAction 应正确调用 $form.submit', () => {
    let called = false
    const form = { ...mock$form, submit: () => { called = true } }
    invokeAction('submit', undefined, form as $Form)
    expect(called).toBe(true)
  })

  it('invokeAction 应正确调用 $form.setFieldValue', () => {
    let key = ''
    let val: unknown
    const form = { ...mock$form, setFieldValue: (n: string, v: unknown) => { key = n; val = v } }
    invokeAction('setFieldValue', { name: 'field1', value: 42 }, form as $Form)
    expect(key).toBe('field1')
    expect(val).toBe(42)
  })

  it('invokeAction 对未知 action 应 console.warn', () => {
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (...args: any[]) => { warnings.push(String(args[0])) }
    invokeAction('nonexistent', undefined, mock$form)
    console.warn = originalWarn
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain('未知 action')
  })
})
