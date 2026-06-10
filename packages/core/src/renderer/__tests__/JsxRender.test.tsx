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
import { fireEvent, render } from '@testing-library/react'
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

/**
 * JsxRender — useState 跨父级 re-render 持久化
 *
 * 场景：JSX 字段含 `useState` 计数器按钮，父级 re-render（componentProps 引用变化）
 *       不应让计数器重置为 0；按钮点击应使计数自增。
 *
 * 根因（修复前）：`compileJsxComponent` 把 `fn(...args)` 放在每次 render 的 JsxWrapper
 *       内执行，每次都返回**新**的 Component 函数引用；React 视新引用为新组件类型，
 *       unmount 旧 fiber → useState 归零。
 * 修复：用 useMemo 缓存「求值出的 Component 引用」，使其在 [compiledCode, scope] 未变时稳定。
 */
describe('JsxRender — useState 跨父级 re-render 持久化', () => {
  const counterCompiled = `
function Component() {
  const [count, setCount] = React.useState(0);
  return React.createElement(
    'button',
    { onClick: () => setCount((c) => c + 1) },
    'count=' + count
  );
}
return typeof Component === 'function' ? Component : null;
`

  it('父级以**新引用**重新传入 componentProps 时，useState 状态不应重置', () => {
    const { container, rerender } = render(
      <JsxRender
        compiledCode={counterCompiled}
        scope={{}}
        componentProps={{ theme: 'a' }}
        value={undefined}
        onChange={() => {}}
      />,
    )
    // 初始 count=0
    const button = container.querySelector('button') as HTMLButtonElement
    expect(button).not.toBeNull()
    expect(button.textContent).toBe('count=0')

    // 点击 3 次
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button.textContent).toBe('count=3')

    // 父级以**新引用**的 componentProps 重新渲染（这是触发原 bug 的关键条件）
    rerender(
      <JsxRender
        compiledCode={counterCompiled}
        scope={{}}
        componentProps={{ theme: 'b' }}
        value={undefined}
        onChange={() => {}}
      />,
    )

    // 关键断言：state 不应重置为 0
    const buttonAfter = container.querySelector('button') as HTMLButtonElement
    expect(buttonAfter).not.toBeNull()
    expect(buttonAfter.textContent).toBe('count=3')

    // 再次点击应继续自增
    fireEvent.click(buttonAfter)
    expect(buttonAfter.textContent).toBe('count=4')
  })

  it('onChange 引用变化不应导致组件 unmount（state 仍持久）', () => {
    const onChange1 = vi.fn()
    const onChange2 = vi.fn()

    const { container, rerender } = render(
      <JsxRender
        compiledCode={counterCompiled}
        scope={{}}
        componentProps={{}}
        value={undefined}
        onChange={onChange1}
      />,
    )
    const button = container.querySelector('button') as HTMLButtonElement
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button.textContent).toBe('count=2')

    // 父级切换 onChange 引用 → 旧实现下会 unmount → state 归零
    rerender(
      <JsxRender
        compiledCode={counterCompiled}
        scope={{}}
        componentProps={{}}
        value={undefined}
        onChange={onChange2}
      />,
    )
    const buttonAfter = container.querySelector('button') as HTMLButtonElement
    expect(buttonAfter.textContent).toBe('count=2')
  })
})
