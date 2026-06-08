import React, { useCallback, useMemo } from 'react'
import { type FormFieldSchema, type FormSchema, type OptionItem } from '../types/schema'
import type { EventCallbacks } from '../types/events'
import type { EventContext } from '../events'
import { StyleProvider, useEnsureDefaultTheme, useHasStyleProvider, useStyle } from '../styles'
import type { PartialThemeTokens } from '../styles/types'
import type { ThemeMode, SizeMode } from '../styles/StyleProvider'
import type { ComponentRenderFn, FormEngineAdapter, FormWrapperProps } from '../types/adapter'
import { isContainerComponent } from '../components'
import type { DataSourceResolver } from '../types/render'
import { pickAdapter } from '../utils'
import { FieldRenderer } from './FieldRenderer'
import { useFormRender } from './hooks/useFormRender'
import { FormConfigContext, useFormConfig } from './FormConfigContext'
import { InsideContainerContext } from './InsideContainerContext'
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
  /** 主题模式，透传给 StyleProvider */
  themeMode?: ThemeMode
  /** 尺寸模式，透传给 StyleProvider */
  sizeMode?: SizeMode
  /** 主题覆盖，透传给 StyleProvider */
  theme?: PartialThemeTokens
  /**
   * 提交前钩子
   * - 返回修改后的 values 可转换提交数据
   * - 返回 false 可阻止提交
   * - 返回 void 或 undefined 继续提交
   */
  beforeSubmit?: (values: Record<string, unknown>) => Record<string, unknown> | false | void
  /**
   * 提交后钩子
   * - success=true 表示提交成功
   * - success=false 表示校验失败
   */
  afterSubmit?: (values: Record<string, unknown>, success: boolean) => void
}

/**
 * 防抖定时器 Map：fieldName → timer
 * 防止依赖快速变化时频繁发请求
 * 注意：此变量仅用于导出给外部测试，实际运行时每个 FormRender 实例使用内部 useRef
 */
export const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const FormRender = React.forwardRef<FormRenderHandle, FormRenderProps>(({ schema, onSubmit, onChange, dataSourceResolver, components = {}, desktopAdapter, mobileAdapter, scene = 'desktop', initialValues = {}, loading = false, callbacks = {}, themeMode, sizeMode, theme, beforeSubmit, afterSubmit }, ref) => {
  const hasStyleProvider = useHasStyleProvider()
  const resolvedAdapter = pickAdapter(desktopAdapter, mobileAdapter, scene) as FormEngineAdapter
  const bridgeProvider = resolvedAdapter?.bridgeProvider

  // 内层内容
  const inner = (
    <FormRenderInner
      ref={ref}
      schema={schema}
      onSubmit={onSubmit}
      onChange={onChange}
      dataSourceResolver={dataSourceResolver}
      components={components}
      desktopAdapter={desktopAdapter}
      mobileAdapter={mobileAdapter}
      scene={scene}
      initialValues={initialValues}
      loading={loading}
      callbacks={callbacks}
      beforeSubmit={beforeSubmit}
      afterSubmit={afterSubmit}
    />
  )

  // 包裹 BridgeProvider（adapter 提供）
  const withBridge = bridgeProvider
    ? React.createElement(bridgeProvider, null, inner)
    : inner

  // 包裹 StyleProvider（如果外层没有）
  if (hasStyleProvider) {
    return withBridge as React.ReactElement
  }

  return (
    <StyleProvider themeMode={themeMode} sizeMode={sizeMode} theme={theme}>
      {withBridge}
    </StyleProvider>
  ) as React.ReactElement
})
FormRender.displayName = 'FormRender'

/** 内置默认 Form 容器 — 使用原生 <form> 元素 */
const DefaultFormWrapper: React.FC<FormWrapperProps> = ({ onSubmit, children, className, style }) => (
  <form
    onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault()
      }
    }}
    className={className}
    style={style}
  >
    {children}
  </form>
)

/** FormRender 内部实现，在 StyleProvider + BridgeProvider 内部渲染 */
const FormRenderInner = React.forwardRef<FormRenderHandle, Omit<FormRenderProps, 'themeMode' | 'sizeMode' | 'theme'>>(({ schema, onSubmit, onChange, dataSourceResolver, components = {}, desktopAdapter, mobileAdapter, scene = 'desktop', initialValues = {}, loading = false, callbacks = {}, beforeSubmit, afterSubmit }, ref) => {
  useEnsureDefaultTheme()
  const { token } = useStyle()

  const resolvedAdapter = pickAdapter(desktopAdapter, mobileAdapter, scene) as FormEngineAdapter
  const formConfig = schema.form

  const {
    formValues, formValuesRef, visibleFields,
    fieldErrors, fieldOptions,
    handleFieldChange, handleSubmit,
    $form, eventContext, reset, validate,
  } = useFormRender({ schema, initialValues, onSubmit, onChange, dataSourceResolver, callbacks, adapterValidate: resolvedAdapter?.validate, beforeSubmit, afterSubmit })

  React.useImperativeHandle(ref, () => ({ submit: handleSubmit, reset, validate }), [handleSubmit, reset, validate])

  const handleFormSubmit = () => {
    handleSubmit()
  }

  const FormTag = resolvedAdapter?.FormWrapper ?? DefaultFormWrapper

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
          <FormTag formConfig={formConfig} scene={resolvedAdapter?.scene ?? 'desktop'} onSubmit={handleFormSubmit} className="fe-form">
            <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}>
              {visibleFields.map((field) => (
                <div key={field.id} style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}>
                  <NestedFieldRenderer field={field} onFieldChange={handleFieldChange} />
                </div>
              ))}
            </div>
          </FormTag>
        </FormStateContext.Provider>
      </FormEngineContext.Provider>
    </FormConfigContext.Provider>
  )
})
FormRenderInner.displayName = 'FormRenderInner'

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
    const childNodes = field.children.map((child) => (
      <InsideContainerContext.Provider key={child.id} value={true}>
        <NestedFieldRenderer field={child} onFieldChange={onFieldChange} />
      </InsideContainerContext.Provider>
    ))
    return { ...field, componentProps: { ...field.componentProps, children: childNodes } }
  }, [field, isContainer, onFieldChange])

  return <FieldRenderer field={enhancedField} value={formValues[field.name]} onChange={handleChange} options={fieldOptions[field.name] || []} disabled={loading || field.disabled === true} adapter={adapter} components={components} eventContext={eventContext} errors={fieldErrors[field.name]} formConfig={formConfig} />
})
NestedFieldRenderer.displayName = 'NestedFieldRenderer'
