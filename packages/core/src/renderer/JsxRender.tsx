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
      const result = fn(...args) as React.ComponentType<Record<string, unknown>> | React.ReactElement | null
      if (typeof result === 'function') {
        return React.createElement(result, props)
      }
      if (result == null || typeof result === 'string') return null
      return result
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
