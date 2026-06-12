import React, { useCallback, useContext, useMemo } from 'react'
import { useDesignerAdapters } from '../../designer/DesignerContext'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'
import { resolveSlot } from '../../registry/propertySlotRegistry'
import type {
  AvailablePropGroup,
  AvailablePropItem,
  AvailablePropsData,
} from '../../registry/propertySlotRegistry/fallbacks/CodeEditor'
import { FormEngineContext } from '../../renderer/FormEngineContext'

/** 内部使用的 key，会被过滤掉不向用户展示 */
const INTERNAL_COMPONENT_PROP_KEYS = new Set(['code', 'compiledCode'])

export default function JsxPropsRender({ widgets: w, slots, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const c = locale.component.jsx
  const ce = locale.widget.codeEditor
  const CodeEditor = useMemo(() => resolveSlot('codeEditor', slots, w), [slots, w])
  // 设计期 PropertyPanel 不在 FormEngineContext.Provider 内；通过 useDesignerAdapters()
  // 拿到 desktopAdapter.jsxScope 才是真实的可用组件清单（如 AntCard / AntButton）。
  // 运行时（如自定义 FormField 内使用 JSX 编辑器）则走 FormEngineContext.jsxScope。
  const engineCtx = useContext(FormEngineContext)
  const adapters = useDesignerAdapters()

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

  /**
   * 运行时会被注入到 Component 函数顶层的 props 清单（按来源分组）。
   * 1) 稳定注入：value / onChange / scene；
   * 2) 字段 componentProps：用户在 PropertyPanel 配置的自定义 key（除内部 code/compiledCode 外）；
   * 3) jsxScope：design-time 取 DesignerConfigContext 的 desktopAdapter + mobileAdapter 合并；
   *             runtime 取 FormEngineContext.jsxScope。FormEngineContext 优先。
   * 不使用 useMemo：依赖 jsxScope 是对象引用，React Compiler 无法证明稳定，
   * 包 useMemo 会触发"Compilation Skipped"。该计算成本极低（O(k)），无需手动缓存。
   */
  const componentPropKeys = Object.keys(values ?? {}).filter((k) => !INTERNAL_COMPONENT_PROP_KEYS.has(k))

  // jsxScope 来源优先级：runtime FormEngineContext > designer desktopAdapter + mobileAdapter 合并
  // 合并顺序：desktop 在前，mobile 在后（同名 key 时 mobile 覆盖 desktop；实际 antd / antd-mobile
  // 命名空间 Ant / Antm 互不冲突，所以这只是兜底策略）。
  const runtimeScope = engineCtx?.jsxScope
  const designerScope =
    !runtimeScope && (adapters.desktopAdapter?.jsxScope || adapters.mobileAdapter?.jsxScope)
      ? { ...adapters.desktopAdapter?.jsxScope, ...adapters.mobileAdapter?.jsxScope }
      : undefined
  const jsxScope = runtimeScope ?? designerScope
  const scopeKeys = jsxScope ? Object.keys(jsxScope) : []

  const stableGroup: AvailablePropGroup = {
    title: ce.availablePropsGroupStable ?? 'Stable',
    items: [{ name: 'value' }, { name: 'onChange' }, { name: 'scene' }],
  }

  const fieldPropsGroup: AvailablePropGroup | null =
    componentPropKeys.length === 0
      ? null
      : {
          title: ce.availablePropsGroupFieldProps ?? 'Field Props',
          items: componentPropKeys.map<AvailablePropItem>((k) => ({ name: k })),
        }

  const scopeGroup: AvailablePropGroup | null =
    !jsxScope || scopeKeys.length === 0
      ? null
      : {
          title: ce.availablePropsGroupScope ?? 'Scope',
          items: scopeKeys.map<AvailablePropItem>((k) => ({ name: k })),
        }

  const groups: AvailablePropGroup[] = [stableGroup, fieldPropsGroup, scopeGroup].filter(
    (g): g is AvailablePropGroup => g !== null,
  )
  const availableProps: AvailablePropsData = { groups }

  return (
    <FieldItem label={c.code}>
      {/* eslint-disable-next-line react-hooks/static-components */}
      <CodeEditor
        value={(values.code as string) ?? ''}
        onChange={(v) => onChange('code', v)}
        placeholder={c.codePlaceholder}
        context={{ language: 'jsx', onCompile: handleCompile, availableProps }}
      />
    </FieldItem>
  )
}
