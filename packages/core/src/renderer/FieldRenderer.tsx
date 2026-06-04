import React, { useCallback, useMemo } from 'react'
import { getEventDeclarations } from '../components'
import { resolveEvents, type EventContext } from '../events'
import { useStyle } from '../styles'
import type { ComponentRenderFn, FieldComponentProps, FormEngineAdapter } from '../types/adapter'
import { isFormComponent } from '../types/component-category'
import type { $Self, ResolvedEventHandler } from '../types/events'
import type { FormConfig, FormFieldSchema, OptionItem } from '../types/schema'
import { evalExpr, matchVisibleWhen } from '../utils'
import { AdapterContext } from './AdapterContext'
import { FieldSchemaContext } from './FieldSchemaContext'

export interface FieldRendererProps {
  field: FormFieldSchema
  value: unknown
  onChange: (val: unknown) => void
  options: OptionItem[]
  disabled: boolean
  adapter: FormEngineAdapter
  components?: Record<string, ComponentRenderFn>
  /**
   * 事件上下文（由 FormRender 注入）
   * 不传时事件系统降级为无 events 配置（向后兼容）
   */
  eventContext?: EventContext
  /** 校验错误信息（由 FormRender 的 fieldErrors 注入） */
  errors?: string[]
  /** 已解析的表单全局配置（labelCol/wrapperCol 保证存在） */
  formConfig: FormConfig
}

/**
 * 单字段渲染器
 *
 * 组件查找优先级（三层覆盖机制）：
 * 1. adapter.components[field.type] — 标准类型映射（如 'input' → InputField）
 * 2. components[componentId]        — 自定义组件注册表（schema.type='custom' 时按 componentId 查找）
 * 3. adapter.default                — 兜底渲染（避免白屏）
 *
 * 事件合并优先级（后写覆盖前写）：
 * 内置 props < componentProps < 事件处理器（events 解析结果）
 */
export function FieldRenderer({ field, value, onChange, options, disabled, adapter, components = {}, eventContext, errors, formConfig }: FieldRendererProps) {
  const { token } = useStyle()

  // 判断是否禁用
  const isDisabled = disabled || (typeof field.disabled === 'string' ? !!evalExpr(field.disabled, { ...({} as Record<string, unknown>), [field.name]: value }) : false) || (field.disabledIfExpr ? !!evalExpr(field.disabledIfExpr, { ...({} as Record<string, unknown>), [field.name]: value }) : false)

  // 判断是否必填
  const isRequired = field.rules?.some((r) => r.required) || (field.requiredIfExpr ? !!evalExpr(field.requiredIfExpr, { ...({} as Record<string, unknown>), [field.name]: value }) : false) || (field.requiredWhen ? matchVisibleWhen(field.requiredWhen, { [field.name]: value } as Record<string, unknown>) : false)

  // label 渲染（仅表单组件显示 label）
  const showLabel = isFormComponent(field.type) && field.label
  const colon = formConfig.colon
  const labelText = field.label + (colon ? '：' : '')
  const labelStyle = useMemo(
    () => ({
      display: 'block',
      marginBottom: 'var(--fe-spacing-xs, 4px)',
      fontWeight: isRequired ? 'var(--fe-font-weight-semibold, 600)' : 'var(--fe-font-weight-regular, 400)',
    }),
    [isRequired],
  )
  const label = !showLabel ? null : (
    <label className="fe-field-label" style={labelStyle}>
      {isRequired && <span style={{ color: token('error') as string, marginRight: 'var(--fe-spacing-xs, 4px)' }}>*</span>}
      {labelText}
      {field.tooltip && (
        <span title={field.tooltip} style={{ marginLeft: 'var(--fe-spacing-xs, 4px)', cursor: 'help', color: token('textTertiary') as string }}>
          ?
        </span>
      )}
    </label>
  )

  // 通用 props
  const resolvedOptions: OptionItem[] = field.mock?.options?.length ? field.mock.options : options.length ? options : field.dataSource?.type === 'static' ? field.dataSource.static.options : []

  // 解析事件处理器（memo 避免每次渲染重建 handler 闭包）
  const $self: $Self = useMemo(
    () => ({
      name: field.name,
      value,
      schema: field,
      props: {
        disabled: isDisabled,
        readOnly: !!field.readOnly,
        placeholder: field.placeholder,
      },
    }),
    [field.name, value, field, isDisabled, field.readOnly, field.placeholder],
  )

  const eventHandlers: Record<string, ResolvedEventHandler> = useMemo(() => (eventContext ? resolveEvents(field.events, $self, eventContext.$form, eventContext.callbacks, getEventDeclarations(field.type)) : {}), [eventContext, field.events, field.type, $self])

  // onChange 包装：先更新当前字段值，再执行用户事件
  // IME 组合输入由各 adapter 通过 nativeEvent.isComposing 自行拦截
  const handleChange = useCallback(
    (newValue: unknown) => {
      onChange(newValue)
      eventHandlers.onChange?.(newValue)
    },
    [onChange, eventHandlers],
  )

  const errorMsg = errors && errors.length > 0 ? errors[0] : undefined

  const fieldProps: FieldComponentProps & Record<string, unknown> = useMemo(
    () => ({
      value,
      onChange: handleChange,
      disabled: isDisabled,
      readOnly: field.readOnly,
      placeholder: field.placeholder,
      options: resolvedOptions,
      fieldSchema: field,
      required: isRequired,
      rules: field.rules,
      validateStatus: errorMsg ? 'error' : undefined,
      help: errorMsg,
      ...field.componentProps,
      ...eventHandlers,
    }),
    [value, handleChange, isDisabled, resolvedOptions, field, isRequired, errorMsg, eventHandlers],
  )

  /**
   * 查找渲染函数（按优先级）
   */
  const renderFn: ComponentRenderFn =
    // 1. 标准类型映射
    adapter.components[field.type] ||
    // 2. 自定义组件（按 componentId 查找）
    (field.custom?.componentId ? components[field.custom.componentId] : undefined) ||
    // 3. 兜底
    adapter.default

  const { labelCol, wrapperCol } = formConfig.scenes[adapter.scene]
  const labelColSpan = labelCol.span
  const wrapperColSpan = wrapperCol.span
  const isHorizontal = !(labelColSpan === 24 && wrapperColSpan === 24)

  const fieldContent = (
    <>
      <FieldSchemaContext.Provider value={field}>
        <AdapterContext.Provider value={adapter}>
          {/* 使用 React.createElement 而非直接调用 renderFn，避免当 renderFn 为函数组件时
            其内部 hooks 被计入 FieldRenderer 的 hooks 链，导致 hooks 顺序错误。
            Suspense 包裹：支持 adapter 使用 React.lazy 做代码分割。 */}
          <React.Suspense fallback={null}>
            {}
            {React.createElement(renderFn, fieldProps)}
          </React.Suspense>
        </AdapterContext.Provider>
      </FieldSchemaContext.Provider>
      {errorMsg && <div style={{ color: token('error') as string, fontSize: token('fontSizeXs') as string, marginTop: token('spacingXs') }}>{errorMsg}</div>}
    </>
  )

  if (!showLabel || !isHorizontal) {
    return (
      <div className="fe-field" style={!renderFn ? { padding: `${token('spacingSm')} 0`, color: token('textTertiary') as string } : undefined}>
        {label}
        {fieldContent}
      </div>
    )
  }

  return (
    <div className="fe-field" style={{ display: 'flex', gap: token('spacingSm'), alignItems: 'flex-start' }}>
      <div style={{ width: `${(labelColSpan / 24) * 100}%`, flexShrink: 0, textAlign: formConfig.labelAlign }}>{label}</div>
      <div style={{ width: `${(wrapperColSpan / 24) * 100}%` }}>{fieldContent}</div>
    </div>
  )
}
