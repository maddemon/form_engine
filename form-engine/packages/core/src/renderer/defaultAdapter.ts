import React from 'react'
import type { FormAdapter, FieldComponentProps, FieldRendererFn } from '../types/adapter'
import { getComponent } from '../registry/componentRegistry'

/**
 * 默认 adapter：基于 componentRegistry 动态查找组件
 *
 * 设计思路：
 * - 使用 Proxy 拦截属性访问，动态返回 FieldRendererFn
 * - 若 field.type 未注册，返回 undefined，让 FieldRenderer 的兜底逻辑生效
 * - adapter['default'] 返回统一的兜底渲染函数
 */
const defaultAdapter: FormAdapter = new Proxy({} as FormAdapter, {
  get(target, prop: string | symbol) {
    // 特殊处理内部属性
    if (prop === '_designerWidgets') return undefined
    if (prop === 'default') {
      // 兜底渲染函数：渲染一个带警告的占位符
      return ((props: FieldComponentProps) => {
        return React.createElement(
          'div',
          { style: { padding: 8, border: '1px dashed #ff4d4f', borderRadius: 4, color: '#ff4d4f', fontSize: 12 } },
          `未知字段类型: ${(props as any).fieldSchema?.type || 'unknown'}`
        )
      }) as FieldRendererFn
    }

    const type = String(prop)
    // 尝试多种命名形式：原样、首字母大写、PascalCase
    const candidates = [
      type,
      type.charAt(0).toUpperCase() + type.slice(1),
      // 处理 kebab-case：input-number -> InputNumber
      type.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(''),
    ]

    // 若未注册该类型，返回 undefined，让 FieldRenderer 的 fallback 链继续
    if (!candidates.some(c => getComponent(c))) return undefined

    // 查找已注册的组件（尝试多种命名形式）
    let Component: React.ComponentType<any> | null = null
    for (const c of candidates) {
      const comp = getComponent(c)
      if (comp) {
        Component = comp
        break
      }
    }
    if (!Component) return undefined

    // 返回 FieldRendererFn
    return ((props: FieldComponentProps) => {
      const { value, onChange, fieldSchema, ...rest } = props
      return React.createElement(Component!, {
        ...rest,
        value,
        onChange,
        fieldSchema,
      })
    }) as FieldRendererFn
  },
})

export default defaultAdapter
