import { useMemo } from 'react'
import type { FormSchema } from '../../types/schema'
import { evalExpr, matchVisibleWhen } from '../../utils'

export interface UseVisibilityResult {
  visibleFields: FormSchema['fields']
}

export function useVisibility(
  formSchema: FormSchema,
  formValues: Record<string, unknown>,
): UseVisibilityResult {
  const visibleFields = useMemo(
    () =>
      formSchema.fields.filter((field) => {
        if (field.hidden === true) return false
        if (typeof field.hidden === 'string') {
          return !evalExpr(field.hidden, formValues)
        }
        if (field.visibleIfExpr) {
          return !!evalExpr(field.visibleIfExpr, formValues)
        }
        if (field.visibleWhen) {
          return matchVisibleWhen(field.visibleWhen, formValues)
        }
        return true
      }),
    [formSchema.fields, formValues],
  )
  return { visibleFields }
}
