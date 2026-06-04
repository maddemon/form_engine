import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type FormFieldSchema, type FormSchema, type OptionItem } from '../types/schema'

import { checkRequiredDeps, getDataSourceDeps, resolveDataSource } from '../dataSource/resolver'
import type { EventContext } from '../events'
import { useEnsureDefaultTheme, useStyle } from '../styles'
import type { FormEngineAdapter } from '../types/adapter'
import { isContainerComponent } from '../types/component-category'
import type { $Form } from '../types/events'
import type { DataSourceResolver } from '../types/render'
import { evalExpr, matchVisibleWhen, pickAdapter } from '../utils'
import { FieldRenderer } from './FieldRenderer'
import { validateForm } from './validate'

export interface FormRenderHandle {
  submit(): void
  reset(): void
  validate(name?: string): Promise<boolean>
}

export interface FormRenderProps {
  schema: FormSchema
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  components?: Record<string, (props: any) => React.ReactNode>
  /** 桌面端适配器 */
  desktopAdapter?: FormEngineAdapter
  /** 移动端适配器 */
  mobileAdapter?: FormEngineAdapter
  /** 当前场景（默认 'desktop'） */
  scene?: import('../types/adapter').DeviceScene
  initialValues?: Record<string, unknown>
  loading?: boolean
  /**
   * 事件回调（供 EventHandler.type='callback' 引用）
   * key 为回调名，value 为函数；运行时会按 name 查表
   */
  callbacks?: Record<string, (...args: any[]) => void>
}

/**
 * 防抖定时器 Map：fieldName → timer
 * 防止依赖快速变化时频繁发请求
 * 注意：此变量仅用于导出给外部测试，实际运行时每个 FormRender 实例使用内部 useRef
 */
export const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const FormRender = React.forwardRef<FormRenderHandle, FormRenderProps>(({ schema, onSubmit, onChange, dataSourceResolver, components = {}, desktopAdapter, mobileAdapter, scene = 'desktop', initialValues = {}, loading = false, callbacks = {} }, ref) => {
  useEnsureDefaultTheme()
  const { token } = useStyle()

  // 根据 scene 选取 adapter
  const resolvedAdapter = pickAdapter(desktopAdapter, mobileAdapter, scene) as FormEngineAdapter

  const formConfig = schema.form

  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues)
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})
  // 记录每个 field 当前请求的依赖快照，避免过期响应覆盖
  const [fieldDepsSnapshot, setFieldDepsSnapshot] = useState<Record<string, string>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // 每个实例独立的防抖定时器
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const formSchema = useMemo(() => schema, [schema])

  // 过滤可见字段
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

  // 字段值变化
  // setFormValues 立即更新（保证受控输入正确渲染），onChange 回调做防抖
  const onChangeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const formValuesRef = useRef(formValues)
  const onChangeRef = useRef(onChange)

  // render 阶段同步 ref（替代原 useEffect，保持所有下游 useMemo/useCallback 读到最新值）
  formValuesRef.current = formValues
  onChangeRef.current = onChange

  const debouncedOnChange = useCallback(() => {
    if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current)
    onChangeTimerRef.current = setTimeout(() => {
      onChangeRef.current?.(formValuesRef.current)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current)
    }
  }, [])

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      setFormValues((prev) => {
        const next = { ...prev, [name]: value }
        return next
      })
      setFieldErrors((prev) => {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      })
      debouncedOnChange()
    },
    [debouncedOnChange],
  )

  // 单字段设值（供事件系统 $form.setFieldValue 调用）
  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      handleFieldChange(name, value)
    },
    [handleFieldChange],
  )

  // 批量设值
  const setFieldsValue = useCallback(
    (patch: Record<string, unknown>) => {
      setFormValues((prev) => {
        const next = { ...prev, ...patch }
        onChange?.(next)
        return next
      })
    },
    [onChange],
  )

  // 取单字段值
  const getFieldValue = useCallback((name: string): unknown => formValues[name], [formValues])

  // 重置表单
  const reset = useCallback(() => {
    setFormValues(initialValues)
    setFieldErrors({})
    onChange?.(initialValues)
  }, [initialValues, onChange])

  // 提交表单（先校验后提交）
  const submit = useCallback(() => {
    const result = validateForm(visibleFields, formValues)
    if (!result.valid) {
      setFieldErrors(result.errors)
      return
    }
    setFieldErrors({})
    onSubmit?.(formValues)
  }, [onSubmit, formValues, visibleFields])

  // 校验表单
  const validate = useCallback(
    async (name?: string): Promise<boolean> => {
      const result = validateForm(formSchema.fields, formValues, name)
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result.valid
    },
    [formSchema.fields, formValues],
  )

  // $form API 实例（values getter 通过 ref 访问最新 formValues，避免每次输入都重建）
  const $form: $Form = useMemo(
    () => ({
      get values(): Record<string, unknown> {
        return formValuesRef.current
      },
      setFieldValue,
      setFieldsValue,
      getFieldValue,
      submit,
      reset,
      validate,
    }),
    [setFieldValue, setFieldsValue, getFieldValue, submit, reset, validate],
  )

  React.useImperativeHandle(ref, () => ({ submit, reset, validate }), [submit, reset, validate])

  // 事件上下文（供 FieldRenderer 注入）
  // formValues 通过 $form.values 间接访问，不直接依赖 formValues 避免每次输入重建
  const eventContext: EventContext = useMemo(
    () => ({
      formValues,
      $form,
      callbacks,
    }),
    // formValues intentionally excluded — accessed via $form.values getter when needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [$form, callbacks],
  )

  /**
   * 加载单个字段的 dataSource
   * - static：同步读取
   * - remote：异步请求，带防抖 + 依赖快照校验
   */
  const loadDataSource = useCallback(
    async (field: FormFieldSchema, debounceMs = 300) => {
      if (!field.dataSource) return
      const ds = field.dataSource

      // static：直接写入
      if (ds.type === 'static') {
        setFieldOptions((prev) => ({
          ...prev,
          [field.name]: ds.static.options || [],
        }))
        return
      }

      // remote：异步加载（带防抖）
      if (ds.type === 'remote') {
        const currentValues = formValuesRef.current

        // 检查 requiredDeps
        if (!checkRequiredDeps(ds, currentValues)) return

        // 清除该 field 的旧定时器
        const timers = debounceTimersRef.current
        const existing = timers.get(field.name)
        if (existing) clearTimeout(existing)

        const timer = setTimeout(async () => {
          try {
            const latestValues = formValuesRef.current
            // 记录当前依赖快照
            const deps = getDataSourceDeps(ds)
            const snapshot = deps.map((d) => `${d}=${(latestValues as Record<string, unknown>)[d]}`).join(',')
            setFieldDepsSnapshot((prev) => ({ ...prev, [field.name]: snapshot }))

            const options = await resolveDataSource(
              ds,
              {
                fieldName: field.name,
                formValues: latestValues,
                fieldSchema: field,
                formSchema: schema,
              },
              dataSourceResolver,
            )

            // 校验快照：如果依赖在请求期间发生了变化，丢弃本次结果
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
    },
    [schema, dataSourceResolver],
  )

  /**
   * 初始化加载：所有有 dataSource 的字段
   * static 立即加载，remote 检查 deps 后加载
   */
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
  }, []) // 仅初始化

  /**
   * 依赖变化时重新加载 remote dataSource
   */
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleFormSubmit} className="fe-form">
      <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}>
        {visibleFields.map((field) => (
          <div key={field.id || field.name} style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}>
            <NestedFieldRenderer field={field} formValues={formValues} fieldOptions={fieldOptions} fieldErrors={fieldErrors} loading={loading} adapter={resolvedAdapter} components={components} eventContext={eventContext} formConfig={formConfig} onFieldChange={handleFieldChange} />
          </div>
        ))}
      </div>
    </form>
  )
})
FormRender.displayName = 'FormRender'

// ── NestedFieldRenderer（递归字段渲染器，含 React.memo）─────────────

interface NestedFieldRendererProps {
  field: FormFieldSchema
  formValues: Record<string, unknown>
  fieldOptions: Record<string, OptionItem[]>
  fieldErrors: Record<string, string[]>
  loading: boolean
  adapter: FormEngineAdapter
  components: Record<string, (props: any) => React.ReactNode>
  eventContext: EventContext
  formConfig: FormSchema['form']
  onFieldChange: (name: string, value: unknown) => void
}

const NestedFieldRenderer: React.FC<NestedFieldRendererProps> = React.memo(({ field, formValues, fieldOptions, fieldErrors, loading, adapter, components, eventContext, formConfig, onFieldChange }) => {
  const isContainer = isContainerComponent(field.type)

  const handleChange = useCallback((val: unknown) => onFieldChange(field.name, val), [field.name, onFieldChange])

  const enhancedField: FormFieldSchema = useMemo(() => {
    if (!isContainer || !field.children?.length) return field
    const childNodes = field.children.map((child) => <NestedFieldRenderer key={child.id || child.name} field={child} formValues={formValues} fieldOptions={fieldOptions} fieldErrors={fieldErrors} loading={loading} adapter={adapter} components={components} eventContext={eventContext} formConfig={formConfig} onFieldChange={onFieldChange} />)
    return { ...field, componentProps: { ...field.componentProps, children: childNodes } }
  }, [field, isContainer, formValues, fieldOptions, fieldErrors, loading, adapter, components, eventContext, formConfig, onFieldChange])

  return <FieldRenderer field={enhancedField} value={formValues[field.name]} onChange={handleChange} options={fieldOptions[field.name] || []} disabled={loading || field.disabled === true} adapter={adapter} components={components} eventContext={eventContext} errors={fieldErrors[field.name]} formConfig={formConfig} />
})
NestedFieldRenderer.displayName = 'NestedFieldRenderer'
