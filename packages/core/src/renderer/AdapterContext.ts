import { createContext, useContext } from 'react'
import type { FormEngineAdapter } from '../types/adapter'

/**
 * Adapter 上下文：FieldRenderer 在 render 时向子树透传 adapter，
 * 供容器类组件（Table/Tabs/Collapse/Grid 等）渲染子字段时使用。
 *
 * 设计动机：
 * 容器组件需要 adapter 来调用 `adapter[child.type]` 渲染子字段。
 * 但把 adapter 放在 fieldProps 里 spread 出去，会污染所有子组件
 * （如 antd-desktop Select 内部在 `omit(rest)` 后透传到 RcSelect，
 *  触发了 "reading 'name' of undefined"），所以必须走 Context。
 */
export const AdapterContext = createContext<FormEngineAdapter | null>(null)

export function useAdapter(): FormEngineAdapter | null {
  return useContext(AdapterContext)
}
