import { useCallback, useMemo } from 'react'
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
