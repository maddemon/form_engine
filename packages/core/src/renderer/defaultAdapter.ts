import React from 'react'
import { getDesktopComponent, getMobileComponent } from '../registry/componentRegistry'
import { FormEngineAdapter, FieldComponentProps, FieldRendererFn } from '../types/adapter'

/**
 * 默认 adapter：基于 componentRegistry 动态查找组件
 *
 * 设计思路：
 * - 使用 Proxy 拦截属性访问，动态返回 FieldRendererFn
 * - 若 field.type 未注册，返回 undefined，让 FieldRenderer 的兜底逻辑生效
 * - adapter['default'] 返回统一的兜底渲染函数
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

const defaultAdapter: FormEngineAdapter = new Proxy({} as FormEngineAdapter, {
  get(_target, prop: string | symbol) {
    if (prop === '_designerWidgets') return undefined
    if (prop === 'default') {
      return ((props: FieldComponentProps) => {
        return React.createElement(
          'div',
          { style: { padding: 8, border: '1px dashed #ff4d4f', borderRadius: 4, color: '#ff4d4f', fontSize: 12 } },
          `未知字段类型: ${(props as any).fieldSchema?.type || 'unknown'}`
        )
      }) as FieldRendererFn
    }

    const type = String(prop)
    const Component = findComponent(type)

    if (!Component) return undefined

    return ((props: FieldComponentProps) => {
      const { value, onChange, fieldSchema, ...rest } = props
      return React.createElement(Component, {
        ...rest,
        value,
        onChange,
        fieldSchema,
      })
    }) as FieldRendererFn
  },
})

export default defaultAdapter
