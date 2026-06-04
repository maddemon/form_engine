import { useCallback, useEffect } from 'react'
import type { FormSchema } from '../types/schema'
import type { DesignerAction } from '../types/designer'

export function useDesignerSync(
  schema: FormSchema | undefined,
  stateSchema: FormSchema,
  onSchemaChange: ((schema: FormSchema) => void) | undefined,
  dispatch: React.Dispatch<DesignerAction>,
) {
  useEffect(() => {
    if (schema) dispatch({ type: 'SET_SCHEMA', schema })
  }, [schema, dispatch])

  const notifyChange = useCallback(
    (s: FormSchema) => { onSchemaChange?.(s) },
    [onSchemaChange],
  )

  useEffect(() => {
    notifyChange(stateSchema)
  }, [stateSchema, notifyChange])
}
