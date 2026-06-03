import { createContext, useContext } from 'react'
import type { FormEngineAdapter } from '../types/adapter'

/**
 * Adapter Context
 *
 * 在组件树中透传 adapter，供容器类组件（Table/Tabs/Collapse/Grid 等）
 * 通过 useAdapter() 获取，再使用 adapter.components[child.type] 渲染子字段。
 *
 * 不把 adapter 放在 fieldProps 中 spread，是因为会污染 antd 等内部组件。
 */
export const AdapterContext = createContext<FormEngineAdapter | null>(null)

export function useAdapter(): FormEngineAdapter | null {
  return useContext(AdapterContext)
}
