import React, { useCallback, useMemo } from 'react'
import { type FormFieldSchema, type FormSchema, type OptionItem } from '../types/schema'
import type { EventCallbacks } from '../types/events'
import type { EventContext } from '../events'
import { useEnsureDefaultTheme, useStyle } from '../styles'
import type { ComponentRenderFn, FormEngineAdapter } from '../types/adapter'
import { isContainerComponent } from '../types/component-category'
import type { DataSourceResolver } from '../types/render'
import { pickAdapter } from '../utils'
import { FieldRenderer } from './FieldRenderer'
import { useFormRender } from './hooks/useFormRender'
import { FormConfigContext, useFormConfig } from './FormConfigContext'
import { FormEngineContext, useFormEngine, type FormEngineContextValue } from './FormEngineContext'
import { FormStateContext, useFormState, type FormStateContextValue } from './FormStateContext'

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
  components?: Record<string, ComponentRenderFn>
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
  callbacks?: EventCallbacks
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

  const resolvedAdapter = pickAdapter(desktopAdapter, mobileAdapter, scene) as FormEngineAdapter
  const formConfig = schema.form

  const {
    formValues, formValuesRef, visibleFields,
    fieldErrors, fieldOptions,
    handleFieldChange, handleSubmit,
    $form, eventContext, reset, validate,
  } = useFormRender({ schema, initialValues, onSubmit, onChange, dataSourceResolver, callbacks })

  React.useImperativeHandle(ref, () => ({ submit: handleSubmit, reset, validate }), [handleSubmit, reset, validate])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const engineCtx = useMemo<FormEngineContextValue>(() => ({
    adapter: resolvedAdapter,
    components,
    loading,
  }), [resolvedAdapter, components, loading])

  const stateCtx = useMemo<FormStateContextValue>(() => ({
    formValues,
    fieldOptions,
    fieldErrors,
    eventContext,
  }), [formValues, fieldOptions, fieldErrors, eventContext])

  return (
    <FormConfigContext.Provider value={formConfig}>
      <FormEngineContext.Provider value={engineCtx}>
        <FormStateContext.Provider value={stateCtx}>
          <form onSubmit={handleFormSubmit} className="fe-form">
            <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}>
              {visibleFields.map((field) => (
                <div key={field.id} style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}>
                  <NestedFieldRenderer field={field} onFieldChange={handleFieldChange} />
                </div>
              ))}
            </div>
          </form>
        </FormStateContext.Provider>
      </FormEngineContext.Provider>
    </FormConfigContext.Provider>
  )
})
FormRender.displayName = 'FormRender'

// ── NestedFieldRenderer（递归字段渲染器，含 React.memo）─────────────

interface NestedFieldRendererProps {
  field: FormFieldSchema
  onFieldChange: (name: string, value: unknown) => void
}

const NestedFieldRenderer: React.FC<NestedFieldRendererProps> = React.memo(({ field, onFieldChange }) => {
  const { adapter, components, loading } = useFormEngine()
  const { formValues, fieldOptions, fieldErrors, eventContext } = useFormState()
  const formConfig = useFormConfig()

  const isContainer = isContainerComponent(field.type)

  const handleChange = useCallback((val: unknown) => onFieldChange(field.name, val), [field.name, onFieldChange])

  const enhancedField: FormFieldSchema = useMemo(() => {
    if (!isContainer || !field.children.length) return field
    const childNodes = field.children.map((child) => <NestedFieldRenderer key={child.id} field={child} onFieldChange={onFieldChange} />)
    return { ...field, componentProps: { ...field.componentProps, children: childNodes } }
  }, [field, isContainer, onFieldChange])

  return <FieldRenderer field={enhancedField} value={formValues[field.name]} onChange={handleChange} options={fieldOptions[field.name] || []} disabled={loading || field.disabled === true} adapter={adapter} components={components} eventContext={eventContext} errors={fieldErrors[field.name]} formConfig={formConfig} />
})
NestedFieldRenderer.displayName = 'NestedFieldRenderer'
