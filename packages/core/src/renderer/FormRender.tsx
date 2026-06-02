import React, { useState, useEffect, useCallback, useMemo } from 'react'
import type { FormFieldSchema, FormSchema, OptionItem } from '../types/schema'
import type { FormEngineAdapter } from '../types/adapter'
import type { DataSourceResolver, CustomComponents } from '../types/render'
import type { $Form } from '../types/events'
import { matchVisibleWhen, evalExpr } from '../utils'
import { FieldRenderer } from './FieldRenderer'
import defaultAdapter from './defaultAdapter'
import { isContainerComponent } from '../types/component-category'
import {
  resolveDataSource,
  checkRequiredDeps,
  getDataSourceDeps,
} from '../dataSource/resolver'
import { validateForm } from './validate'
import type { EventContext } from '../events'

export interface FormRenderProps {
  schema: FormSchema
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  components?: Record<string, (props: any) => React.ReactNode>
  adapter?: FormEngineAdapter
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
 */
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const FormRender: React.FC<FormRenderProps> = ({
  schema,
  onSubmit,
  onChange,
  dataSourceResolver,
  components = {},
  adapter = defaultAdapter,
  initialValues = {},
  loading = false,
  callbacks = {},
}) => {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues)
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})
  // 记录每个 field 当前请求的依赖快照，避免过期响应覆盖
  const [fieldDepsSnapshot, setFieldDepsSnapshot] = useState<Record<string, string>>({})

  const formSchema = useMemo(() => schema, [schema])

  // 过滤可见字段
  const visibleFields = useMemo(
    () =>
      formSchema.fields.filter(field => {
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
  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      setFormValues(prev => {
        const next = { ...prev, [name]: value }
        onChange?.(next)
        return next
      })
    },
    [onChange],
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
      setFormValues(prev => {
        const next = { ...prev, ...patch }
        onChange?.(next)
        return next
      })
    },
    [onChange],
  )

  // 取单字段值
  const getFieldValue = useCallback(
    (name: string): unknown => formValues[name],
    [formValues],
  )

  // 重置表单
  const reset = useCallback(() => {
    setFormValues(initialValues)
    onChange?.(initialValues)
  }, [initialValues, onChange])

  // 提交表单
  const submit = useCallback(() => {
    onSubmit?.(formValues)
  }, [onSubmit, formValues])

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

  // $form API 实例
  const $form: $Form = useMemo(
    () => ({
      get values(): Record<string, unknown> { return formValues },
      setFieldValue,
      setFieldsValue,
      getFieldValue,
      submit,
      reset,
      validate,
    }),
    [formValues, setFieldValue, setFieldsValue, getFieldValue, submit, reset, validate],
  )

  // 事件上下文（供 FieldRenderer 注入）
  const eventContext: EventContext = useMemo(
    () => ({
      formValues,
      $form,
      callbacks,
    }),
    [formValues, $form, callbacks],
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
        setFieldOptions(prev => ({
          ...prev,
          [field.name]: ds.static.options || [],
        }))
        return
      }

      // remote：异步加载（带防抖）
      if (ds.type === 'remote') {
        // 检查 requiredDeps
        if (!checkRequiredDeps(ds, formValues)) return

        // 清除该 field 的旧定时器
        const existing = debounceTimers.get(field.name)
        if (existing) clearTimeout(existing)

        const timer = setTimeout(async () => {
          try {
            // 记录当前依赖快照
            const deps = getDataSourceDeps(ds)
            const snapshot = deps
              .map(d => `${d}=${(formValues as Record<string, unknown>)[d]}`)
              .join(',')
            setFieldDepsSnapshot(prev => ({ ...prev, [field.name]: snapshot }))

            const options = await resolveDataSource(
              ds,
              {
                fieldName: field.name,
                formValues,
                fieldSchema: field,
                formSchema: schema,
              },
              dataSourceResolver,
            )

            // 校验快照：如果依赖在请求期间发生了变化，丢弃本次结果
            const currentSnapshot = deps
              .map(d => `${d}=${(formValues as Record<string, unknown>)[d]}`)
              .join(',')
            if (snapshot !== currentSnapshot) {
              console.warn(`[form-engine] 数据源 ${field.name} 依赖已变化，丢弃过期响应`)
              return
            }

            setFieldOptions(prev => ({ ...prev, [field.name]: options }))
          } catch (err) {
            console.warn(`[form-engine] 数据源加载失败: ${field.name}`, err)
          }
        }, debounceMs)

        debounceTimers.set(field.name, timer)
      }
    },
    [formValues, schema, dataSourceResolver],
  )

  /**
   * 初始化加载：所有有 dataSource 的字段
   * static 立即加载，remote 检查 deps 后加载
   */
  useEffect(() => {
    formSchema.fields.forEach(field => {
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
    formSchema.fields.forEach(field => {
      if (!field.dataSource || field.dataSource.type !== 'remote') return
      const deps = getDataSourceDeps(field.dataSource)
      if (deps.length === 0) return
      if (checkRequiredDeps(field.dataSource, formValues)) {
        loadDataSource(field, 300)
      }
    })
  }, [formValues, formSchema.fields, loadDataSource])

  // 提交（form onSubmit 调用）
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  function renderNestedField(field: FormFieldSchema): React.ReactNode {
    const isContainer = isContainerComponent(field.type)
    const childNodes = isContainer && field.children?.length
      ? field.children.map(renderNestedField)
      : undefined

    const enhancedField: FormFieldSchema = childNodes
      ? { ...field, componentProps: { ...field.componentProps, children: childNodes } }
      : field

    return (
      <FieldRenderer
        field={enhancedField}
        value={formValues[field.name]}
        onChange={val => handleFieldChange(field.name, val)}
        options={fieldOptions[field.name] || []}
        disabled={loading || field.disabled === true}
        adapter={adapter}
        components={components}
        eventContext={eventContext}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="fe-form" style={{ maxWidth: 640 }}>
      <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {visibleFields.map(field => (
          <div
            key={field.id || field.name}
            style={{ width: `${(field.colSpan || 24) / 24 * 100}%` }}
          >
            {renderNestedField(field)}
          </div>
        ))}
      </div>

      {formSchema.submit?.showReset !== false && (
        <div className="fe-form-actions" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>
            {formSchema.submit?.text || '提交'}
          </button>
          {formSchema.submit?.showReset && (
            <button
              type="button"
              onClick={reset}
            >
              {formSchema.submit?.resetText || '重置'}
            </button>
          )}
        </div>
      )}
    </form>
  )
}
