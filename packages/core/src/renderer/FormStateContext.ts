import { createContext, useContext } from 'react'
import type { OptionItem } from '../types/schema'
import type { EventContext } from '../events'

/**
 * FormState Context
 *
 * 表单运行时状态：formValues + fieldOptions + fieldErrors + eventContext。
 * 每次输入变化时 formValues 更新，所有 consumer 重渲染。
 */
export interface FormStateContextValue {
  formValues: Record<string, unknown>
  fieldOptions: Record<string, OptionItem[]>
  fieldErrors: Record<string, string[]>
  eventContext: EventContext
}

export const FormStateContext = createContext<FormStateContextValue | null>(null)

export function useFormState(): FormStateContextValue {
  const ctx = useContext(FormStateContext)
  if (!ctx) throw new Error('useFormState must be used within FormStateContext.Provider')
  return ctx
}
