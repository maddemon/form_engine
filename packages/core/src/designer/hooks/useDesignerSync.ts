import { useEffect, useRef } from 'react'
import type { DesignerAction } from '../../types/designer'
import type { FormSchema } from '../../types/schema'

export function useDesignerSync(
  schema: FormSchema | undefined,
  stateSchema: FormSchema,
  onSchemaChange: ((schema: FormSchema) => void) | undefined,
  dispatch: React.Dispatch<DesignerAction>,
) {
  const lastSyncedSchemaRef = useRef(schema)
  const lastNotifiedSchemaRef = useRef(stateSchema)
  const onSchemaChangeRef = useRef(onSchemaChange)
  useEffect(() => {
    onSchemaChangeRef.current = onSchemaChange
  }, [onSchemaChange])

  useEffect(() => {
    // ── 方向一：外部 schema prop 变化 → 同步到内部 state ──
    if (schema && schema !== lastSyncedSchemaRef.current) {
      lastSyncedSchemaRef.current = schema
      dispatch({ type: 'SET_SCHEMA', schema })
      return // 同一 tick 内不再通知父组件
    }

    // ── 方向二：内部 stateSchema 变化（非由外部 prop 驱动）→ 通知父组件 ──
    if (stateSchema !== lastNotifiedSchemaRef.current) {
      lastNotifiedSchemaRef.current = stateSchema
      onSchemaChangeRef.current?.(stateSchema)
    }
  }, [schema, stateSchema, dispatch])
}
