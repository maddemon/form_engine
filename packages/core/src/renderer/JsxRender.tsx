import React, { useMemo, useRef } from 'react'
import { useStyle } from '../styles'

interface JsxRenderProps {
  compiledCode: string
  scope: Record<string, unknown>
  componentProps: Record<string, unknown>
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * JsxRender — 把 compiledCode 字符串编译成一个真实 React 组件并渲染。
 *
 * compiledCode 的格式（Babel 产物 + 末尾追加）：
 * ```js
 * function Component(props) { ... user body（含 useState 等 hook）... }
 * return typeof Component === 'function' ? Component : null;
 * ```
 *
 * **关键设计**：
 *
 * 1. `new Function('React', ...scopeKeys, 'props', 'value', 'onChange', compiledCode)`
 *    scope 以**函数参数**形式注入（兼容旧式 `function Hello() { return <AntCard .../> }` 写法，
 *    以及新式 `function Hello(props) { return <props.AntCard .../> }` 写法）。
 *
 * 2. `fn(React, ...scope, props, value, onChange)` **仅在 compiledCode 变化时调用一次**。
 *    第一次调用拿到的 `Component` 引用被缓存，父级 re-render 期间保持稳定。
 *    React 看到组件类型引用稳定 → 不 unmount → useState 等 hook 状态保留。
 *
 * 3. scope 引用变化**不**触发重求值（避免破坏 Component 引用稳定性）。
 *    因此 scope 在运行时基本应当保持稳定（来自 FormEngineContext）。
 *    如果用户修改了 jsxScope 的内容，需重新编辑字段代码触发重编译。
 */
export const JsxRender = React.memo<JsxRenderProps>(({ compiledCode, scope, componentProps, value, onChange }) => {
  const { token } = useStyle()
  const scopeKeys = useMemo(() => Object.keys(scope), [scope])

  // 编译产物缓存：仅当 compiledCode 变化时重新构造 `fn` 与求值 Component。
  const compiledRef = useRef<{
    code: string
    fn: ((...args: unknown[]) => unknown) | null
    component: React.ComponentType<Record<string, unknown>> | null
    error: string | null
  } | null>(null)

  if (compiledRef.current == null || compiledRef.current.code !== compiledCode) {
    let fn: ((...args: unknown[]) => unknown) | null = null
    let component: React.ComponentType<Record<string, unknown>> | null = null
    let error: string | null = null

    try {
      fn = new Function('React', ...scopeKeys, 'props', 'value', 'onChange', compiledCode) as (
        ...args: unknown[]
      ) => unknown
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }

    if (fn) {
      try {
        // 用当前 scope 求值一次拿到 Component 引用。
        // 后续父级 re-render 不再调用 fn → Component 引用稳定 → useState 等 hook 状态保留。
        const args: unknown[] = [React]
        for (const k of scopeKeys) {
          args.push(scope[k])
        }
        const evalProps: Record<string, unknown> = { ...componentProps, value, onChange }
        args.push(evalProps, evalProps.value, evalProps.onChange)
        const result = fn(...args)
        if (typeof result === 'function') {
          component = result as React.ComponentType<Record<string, unknown>>
        } else if (result != null && typeof result !== 'string') {
          // 直接 return 元素（非 function 形态）：包一层组件把该元素稳定返回
          const element = result as React.ReactElement
          const DirectElementComponent: React.ComponentType<Record<string, unknown>> =
            function DirectElementComponent() {
              return element
            }
          DirectElementComponent.displayName = 'JsxDirectElement'
          component = DirectElementComponent
        }
      } catch (e) {
        error = `JSX 运行时错误: ${e instanceof Error ? e.message : String(e)}`
      }
    }

    compiledRef.current = { code: compiledCode, fn, component, error }
  }

  // 在父级 re-render 期间，`scope` / `componentProps` / `value` / `onChange` 引用可能变化，
  // 但 Component 引用必须保持稳定（compiledRef 不重算 → React 不 unmount）。这里再用一个 useMemo
  // 仅为承载 props 注入口的稳定 React 组件（props 变化时 React 会自动 re-render 这个 wrapper，
  // 内部 Component 类型不变 → state 保留）。
  const InnerComponent = useMemo(() => {
    if (compiledRef.current && compiledRef.current.component) return compiledRef.current.component
    return null
    // 仅依赖 compiledCode（透过 compiledRef.current 间接反映），不依赖 scope 等。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledCode])

  const errStyle: React.CSSProperties = {
    color: token('error') as string,
    fontSize: token('fontSizeSm') as string,
  }

  if (!InnerComponent) {
    return <div style={errStyle}>{compiledRef.current?.error ?? 'JSX 编译代码错误'}</div>
  }

  // 把 scope 注入为 props（供用户代码通过 props.AntCard / props.AntButton 等访问，新式写法）
  const injectedProps: Record<string, unknown> = { ...componentProps, value, onChange }
  for (const k of scopeKeys) {
    if (!(k in injectedProps)) {
      injectedProps[k] = scope[k]
    }
  }
  return <InnerComponent {...injectedProps} />
})
JsxRender.displayName = 'JsxRender'
