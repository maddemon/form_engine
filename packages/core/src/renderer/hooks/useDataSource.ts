import { useCallback, useEffect, useRef } from 'react'
import { checkRequiredDeps, getDataSourceDeps, resolveDataSource } from '../../dataSource/resolver'
import type { DataSourceResolver } from '../../types/render'
import type { FormFieldSchema, FormSchema, OptionItem } from '../../types/schema'

export interface UseDataSourceOptions {
  formSchema: FormSchema
  formValues: Record<string, unknown>
  formValuesRef: { current: Record<string, unknown> }
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, OptionItem[]>>>
  dataSourceResolver?: DataSourceResolver
}

export interface UseDataSourceResult {
  loadDataSource: (field: FormFieldSchema, debounceMs?: number) => Promise<void>
}

export function useDataSource({
  formSchema,
  formValues,
  formValuesRef,
  setFieldOptions,
  dataSourceResolver,
}: UseDataSourceOptions): UseDataSourceResult {
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const loadDataSource = useCallback(
    async (field: FormFieldSchema, debounceMs = 300) => {
      if (!field.dataSource) return
      const ds = field.dataSource

      if (ds.type === 'static') {
        setFieldOptions((prev) => ({
          ...prev,
          [field.name]: ds.static.options || [],
        }))
        return
      }

      if (ds.type === 'remote') {
        const currentValues = formValuesRef.current
        if (!checkRequiredDeps(ds, currentValues)) return

        const timers = debounceTimersRef.current
        const existing = timers.get(field.name)
        if (existing) clearTimeout(existing)

        const timer = setTimeout(async () => {
          try {
            const latestValues = formValuesRef.current
            const deps = getDataSourceDeps(ds)
            const snapshot = deps.map((d) => `${d}=${(latestValues as Record<string, unknown>)[d]}`).join(',')

            const options = await resolveDataSource(
              ds,
              {
                fieldName: field.name,
                formValues: latestValues,
                fieldSchema: field,
                formSchema,
              },
              dataSourceResolver,
            )

            const currentSnapshot = deps
              .map((d) => `${d}=${(formValuesRef.current as Record<string, unknown>)[d]}`)
              .join(',')
            if (snapshot !== currentSnapshot) {
              console.warn(`[form-engine] 数据源 ${field.name} 依赖已变化，丢弃过期响应`)
              return
            }

            setFieldOptions((prev) => ({ ...prev, [field.name]: options }))
          } catch (err) {
            console.warn(`[form-engine] 数据源加载失败: ${field.name}`, err)
          }
        }, debounceMs)

        timers.set(field.name, timer)
      }
    },
    [formSchema, dataSourceResolver, setFieldOptions, formValuesRef],
  )

  // 初始加载：首次 mount 扫描全部字段；后续仅扫描新增字段
  const mountedRef = useRef(false)
  const prevFieldIdsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const isFirstMount = !mountedRef.current
    mountedRef.current = true
    const prevIds = prevFieldIdsRef.current

    formSchema.fields.forEach((field) => {
      if (!field.dataSource) return
      const isNewField = isFirstMount || !prevIds.has(field.id)
      if (field.dataSource.type === 'static') {
        if (isNewField) loadDataSource(field, 0)
      } else if (field.dataSource.type === 'remote') {
        if (isNewField && checkRequiredDeps(field.dataSource, formValues)) {
          loadDataSource(field, 0)
        }
      }
    })

    prevFieldIdsRef.current = new Set(formSchema.fields.map((f) => f.id))
  }, [formSchema.fields, formValues, loadDataSource])

  useEffect(() => {
    formSchema.fields.forEach((field) => {
      if (!field.dataSource || field.dataSource.type !== 'remote') return
      const deps = getDataSourceDeps(field.dataSource)
      if (deps.length === 0) return
      if (checkRequiredDeps(field.dataSource, formValues)) {
        loadDataSource(field, 300)
      }
    })
  }, [formValues, formSchema.fields, loadDataSource])

  // 组件卸载时清理所有 pending timer
  useEffect(() => {
    return () => {
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer))
      debounceTimersRef.current.clear()
    }
  }, [])

  return { loadDataSource }
}
