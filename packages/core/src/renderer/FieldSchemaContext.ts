import { createContext, useContext } from 'react'
import type { FormFieldSchema } from '../types/schema'

export const FieldSchemaContext = createContext<FormFieldSchema | null>(null)

export function useFieldSchema(): FormFieldSchema | null {
  return useContext(FieldSchemaContext)
}
