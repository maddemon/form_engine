import React, { useEffect, useMemo, useRef } from 'react'
import { useStyle } from '../styles'

interface JsxRenderProps {
  compiledCode: string
  scope: Record<string, unknown>
  componentProps: Record<string, unknown>
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * 把 compiledCode 字符串编译成一个真实 React 组件。
 *
 * 关键设计：compiledCode 的格式是 `function Component(props) { ... user body ... } return Component;`，
 * 末尾返回的是组件函数引用（不是调用结果）。我们用 React.createElement(Component, props) 渲染，
 * 这样 React 会把 Component 当作真正的 React 组件，dispatcher 由 React 在渲染 Component 时正确设置，
 * 用户代码内的 useState 等 hook 都会注册到 Component 的 fiber 上，hooks 顺序与用户代码一致。
 *
 * 如果 compiledCode 不是这种格式（例如直接 return 元素），则按 IIFE 形式编译。
 */
function compileJsxComponent(
  compiledCode: string,
  scopeKeys: string[],
): React.ComponentType<Record<string, unknown>> | null {
  try {
    const fn = new Function('React', ...scopeKeys, 'props', 'value', 'onChange', compiledCode) as (
      ...args: unknown[]
    ) => unknown

    const Component = function JsxWrapper(props: Record<string, unknown>) {
      const value = (props as { value?: unknown }).value
      const onChange = (props as { onChange?: unknown }).onChange
      const args: unknown[] = [React]
      for (const k of scopeKeys) {
        args.push((props as Record<string, unknown>)[k])
      }
      args.push(props, value, onChange)
      let result: unknown
      try {
        // 兜底捕获：编译时烟雾测试只能发现顶层裸引用，函数体内部抛错
        // （如组件首次 render 才触发的 ReferenceError）仍需此处拦截，
        // 避免错误冒到 React 导致整棵树被卸载、页面崩溃。
        result = fn(...args)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return (
          <div
            style={{
              color: 'var(--fe-error)',
              fontSize: 'var(--fe-font-size-sm)',
              padding: '8px 12px',
              background: 'var(--fe-bg-secondary)',
              border: '1px solid var(--fe-border-secondary)',
              borderRadius: 'var(--fe-border-radius-sm)',
              fontFamily: "'Menlo','Consolas',monospace",
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            JSX 运行时错误: {msg}
          </div>
        )
      }
      if (typeof result === 'function') {
        return React.createElement(result as React.ComponentType<Record<string, unknown>>, props)
      }
      if (result == null || typeof result === 'string') return null
      return result as React.ReactElement
    }
    Component.displayName = 'JsxWrapper'
    return Component
  } catch {
    return null
  }
}

export const JsxRender = React.memo<JsxRenderProps>(({ compiledCode, scope, componentProps, value, onChange }) => {
  const { token } = useStyle()
  const scopeKeys = useMemo(() => Object.keys(scope), [scope])

  const componentRef = useRef<{
    code: string
    scope: Record<string, unknown>
    component: React.ComponentType<Record<string, unknown>> | null
  } | null>(null)

  if (
    componentRef.current == null ||
    componentRef.current.code !== compiledCode ||
    componentRef.current.scope !== scope
  ) {
    componentRef.current = {
      code: compiledCode,
      scope,
      component: compileJsxComponent(compiledCode, scopeKeys),
    }
  }

  const errStyle: React.CSSProperties = {
    color: token('error') as string,
    fontSize: token('fontSizeSm') as string,
  }

  useEffect(() => {
    /* no-op */
  }, [compiledCode])

  const InnerComponent = componentRef.current.component
  if (!InnerComponent) {
    return <div style={errStyle}>JSX 编译代码错误</div>
  }

  // 把 scope 注入为 props（供用户代码通过 props.AntCard / props.AntButton 等访问）
  const injectedProps: Record<string, unknown> = { ...componentProps, value, onChange }
  for (const k of scopeKeys) {
    if (!(k in injectedProps)) {
      injectedProps[k] = scope[k]
    }
  }
  return <InnerComponent {...injectedProps} />
})
JsxRender.displayName = 'JsxRender'
