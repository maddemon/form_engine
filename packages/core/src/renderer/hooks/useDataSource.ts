import { useCallback, useEffect, useRef } from 'react'
import type { FormFieldSchema, FormSchema, OptionItem } from '../../types/schema'
import { checkRequiredDeps, getDataSourceDeps, resolveDataSource } from '../../dataSource/resolver'
import type { DataSourceResolver } from '../../types/render'

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
  formSchema, formValues, formValuesRef,
  setFieldOptions, dataSourceResolver,
}: UseDataSourceOptions): UseDataSourceResult {
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const loadDataSource = useCallback(async (field: FormFieldSchema, debounceMs = 300) => {
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

          const currentSnapshot = deps.map((d) => `${d}=${(formValuesRef.current as Record<string, unknown>)[d]}`).join(',')
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
  }, [formSchema, dataSourceResolver, setFieldOptions, formValuesRef])

  useEffect(() => {
    formSchema.fields.forEach((field) => {
      if (!field.dataSource) return
      if (field.dataSource.type === 'static') {
        loadDataSource(field, 0)
      } else if (field.dataSource.type === 'remote') {
        if (checkRequiredDeps(field.dataSource, formValues)) {
          loadDataSource(field, 0)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  return { loadDataSource }
}
