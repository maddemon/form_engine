/**
 * JsxRender 运行时错误兜底测试
 *
 * 场景：用户编写了 Babel 编译通过、但运行时抛错的 JSX 代码
 *       （如顶层裸引用未定义变量）。
 * 预期：
 *   1. 页面**不崩溃**（不抛未捕获异常到 React）
 *   2. 字段区域显示错误信息 "JSX 运行时错误: ..."
 */

import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { JsxRender } from '../JsxRender'

describe('JsxRender — 运行时错误兜底', () => {
  it('编译产物中含未定义引用时不应崩溃，应渲染错误信息', () => {
    // 抑制 React 控制台错误，确保错误确实被组件内部捕获
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // 模拟 Babel 编译产物的形态：function 声明 + 末尾 return typeof Component
    // 顶层含一个未定义引用 `noSuchIdentifier` —— Babel 语法校验通过，运行时抛 ReferenceError
    const compiled = `
function Hello() { return null; }
noSuchIdentifier;
return typeof Component === 'function' ? Component : null;
`

    // 全局错误监听：捕获是否逃逸到 React
    const unhandled: unknown[] = []
    const onError = (e: ErrorEvent) => unhandled.push(e.error ?? e.message)
    window.addEventListener('error', onError)

    try {
      const { container } = render(
        <JsxRender
          compiledCode={compiled}
          scope={{}}
          componentProps={{}}
          value={undefined}
          onChange={() => {}}
        />,
      )

      // 字段区域应显示错误占位，不应崩溃
      const errorEl = container.querySelector('div')
      expect(errorEl).not.toBeNull()
      expect(errorEl?.textContent ?? '').toMatch(/JSX 运行时错误|未定义|ReferenceError/)

      // 关键断言：错误必须**没有**逃逸到 window.onerror
      expect(unhandled).toHaveLength(0)
    } finally {
      window.removeEventListener('error', onError)
      errSpy.mockRestore()
    }
  })

  it('编译产物执行成功时仍正常返回组件', () => {
    const compiled = `
function Hello(props) { return null; }
return typeof Hello === 'function' ? Hello : null;
`
    const { container } = render(
      <JsxRender
        compiledCode={compiled}
        scope={{}}
        componentProps={{}}
        value={undefined}
        onChange={() => {}}
      />,
    )
    // 组件返回 null，container 应为空
    expect(container.firstChild).toBeNull()
  })
})
