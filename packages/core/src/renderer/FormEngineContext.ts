import { createContext, useContext } from 'react'
import type { FormEngineAdapter, ComponentRenderFn } from '../types/adapter'

/**
 * FormEngine Context
 *
 * 整个表单树共享的引擎配置：adapter + components + loading。
 * 渲染期间不变，通过 Context 传递避免逐层 prop drilling。
 */
export interface FormEngineContextValue {
  adapter: FormEngineAdapter
  components: Record<string, ComponentRenderFn>
  loading: boolean
}

export const FormEngineContext = createContext<FormEngineContextValue | null>(null)

export function useFormEngine(): FormEngineContextValue {
  const ctx = useContext(FormEngineContext)
  if (!ctx) throw new Error('useFormEngine must be used within FormEngineContext.Provider')
  return ctx
}
