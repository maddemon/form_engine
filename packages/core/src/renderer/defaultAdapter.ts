import React, { useCallback } from 'react'
import { getDesktopComponent, getMobileComponent } from '../registry/componentRegistry'
import { FormEngineAdapter, FieldComponentProps, FieldRendererFn } from '../types/adapter'

const renderFnCache = new Map<string, FieldRendererFn>()

/**
 * 默认 adapter：基于 componentRegistry 动态查找组件
 */
function findComponent(type: string): React.ComponentType<any> | null {
  const candidates = [
    type,
    type.charAt(0).toUpperCase() + type.slice(1),
    type.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(''),
  ]
  for (const c of candidates) {
    const comp = getDesktopComponent(c) || getMobileComponent(c)
    if (comp) return comp
  }
  return null
}

function createRenderFn(Component: React.ComponentType<any>): FieldRendererFn {
  return (props: FieldComponentProps) => {
    const { value, onChange, fieldSchema: _fs, validateStatus, help, rules, ...rest } = props
    return React.createElement(Component, {
      ...rest,
      value,
      onChange,
    })
  }
}

const defaultRenderFn = ((props: FieldComponentProps) => {
  return React.createElement(
    'div',
    {
      style: {
        padding: 'var(--fe-spacing-sm)',
        border: '1px dashed var(--fe-error)',
        borderRadius: 'var(--fe-border-radius-sm)',
        color: 'var(--fe-error)',
        fontSize: 'var(--fe-font-size-sm)',
      } as React.CSSProperties,
    },
    `未知字段类型: ${(props as any).fieldSchema?.type || 'unknown'}`
  )
}) as FieldRendererFn

const defaultAdapter: FormEngineAdapter = new Proxy({} as FormEngineAdapter, {
  get(_target, prop: string | symbol) {
    if (prop === '_designerWidgets') return undefined
    if (prop === 'default') return defaultRenderFn

    const type = String(prop)
    const cached = renderFnCache.get(type)
    if (cached) return cached

    const Component = findComponent(type)
    if (!Component) return undefined

    const renderFn = createRenderFn(Component)
    renderFnCache.set(type, renderFn)
    return renderFn
  },
})

export default defaultAdapter
