import { createContext, useContext } from 'react'
import type { FormConfig } from '../types/schema'

/**
 * FormConfig Context
 *
 * 整个表单树共享同一个 formConfig，通过 Context 传递避免逐层 prop drilling。
 */
export const FormConfigContext = createContext<FormConfig | null>(null)

export function useFormConfig(): FormConfig {
  const ctx = useContext(FormConfigContext)
  if (!ctx) throw new Error('useFormConfig must be used within FormConfigContext.Provider')
  return ctx
}
