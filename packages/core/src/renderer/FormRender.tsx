import React, { useCallback, useMemo } from 'react'
import { type FormFieldSchema, type FormSchema, type OptionItem } from '../types/schema'
import type { EventContext } from '../events'
import { useEnsureDefaultTheme, useStyle } from '../styles'
import type { ComponentRenderFn, FormEngineAdapter } from '../types/adapter'
import { isContainerComponent } from '../types/component-category'
import type { DataSourceResolver } from '../types/render'
import { pickAdapter } from '../utils'
import { FieldRenderer } from './FieldRenderer'
import { useFormRender } from './hooks/useFormRender'

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
   * 使用 any 因为用户自定义回调签名由使用者决定
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
  components: Record<string, ComponentRenderFn>
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
