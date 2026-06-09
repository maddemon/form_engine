import React, { useCallback, useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import { resolveSlot } from '../../registry/propertySlotRegistry'

export default function JsxPropsRender({ widgets: w, slots, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const c = locale.component.jsx
  const CodeEditor = useMemo(() => resolveSlot('codeEditor', slots, w), [slots, w])

  const handleCompile = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      if (!code.trim()) return { success: true }
      try {
        const Babel = await import('@babel/standalone')
        const result = Babel.transform(code, {
          presets: ['react'],
          filename: 'component.jsx',
        })
        // babel 编译后是顶层函数声明（function Component() {...}），
        // 末尾返回 Component 函数引用，由 JsxRender 用 React.createElement 渲染，
        // 这样 React 会把 Component 当作真正的 React 组件处理，useState 等 hook 注册到正确 fiber
        const compiled = `${result.code ?? ''}\nreturn typeof Component === 'function' ? Component : null;`

        // 烟雾测试：Babel 仅做语法校验，顶层裸引用（如 `未定义变量`）会通过编译，
        // 但在 `new Function` body 求值时抛 ReferenceError。先用最小依赖（仅 React）
        // 试运行一次，捕获顶层运行时错误让模态框直接显示；函数体内部错误由
        // JsxRender 的 try/catch 兜底（见 JsxRender.compileJsxComponent）。
        try {
          const smokeTest = new Function('React', compiled) as (r: typeof React) => unknown
          smokeTest(React)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          return { success: false, error: `JSX 运行时错误: ${msg}` }
        }

        onChange('compiledCode', compiled)
        return { success: true }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        return { success: false, error: msg }
      }
    },
    [onChange],
  )

  return (
    <FieldItem label={c.code}>
      <CodeEditor
        value={(values.code as string) ?? ''}
        onChange={(v) => onChange('code', v)}
        placeholder={c.codePlaceholder}
        context={{ language: 'jsx', onCompile: handleCompile }}
      />
    </FieldItem>
  )
}
