import React, { useCallback, useMemo } from 'react'
import { getEventDeclarations } from '../components'
import { resolveEvents, type EventContext } from '../events'
import { useStyle } from '../styles'
import type { ComponentRenderFn, FieldComponentProps, FormEngineAdapter, FormItemProps } from '../types/adapter'
import { isFormComponent } from '../types/component-category'
import type { $Self, ResolvedEventHandler } from '../types/events'
import type { FormConfig, FormFieldSchema, OptionItem } from '../types/schema'
import { AdapterContext } from './AdapterContext'
import { FieldSchemaContext } from './FieldSchemaContext'
import { useFieldExpression } from './hooks/useFieldExpression'

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

// ============================
// 内置默认 FormItem
// ============================

/**
 * 内置默认 FormItem — 从 FieldRenderer 原有逻辑提取
 *
 * 术语注意：
 * - FormItemProps.help = 静态帮助文本（始终显示在字段下方）
 * - FormItemProps.errors = 校验错误信息（仅校验失败时传入）
 * 两者互不干扰，有错误时显示错误，无错误时显示 help
 */
const DefaultFormItem: React.FC<FormItemProps> = React.memo(function DefaultFormItem({
  label, required, validateStatus, errors, help, tooltip, formConfig, scene, children,
}) {
  const { token } = useStyle()
  const { labelCol, wrapperCol } = formConfig.scenes[scene]
  const labelColSpan = labelCol.span
  const wrapperColSpan = wrapperCol.span
  const isHorizontal = !(labelColSpan === 24 && wrapperColSpan === 24)
  const colon = formConfig.colon
  const labelText = label ? label + (colon ? '：' : '') : null
  const errorMsg = errors && errors.length > 0 ? errors[0] : undefined

  const labelStyle = useMemo(
    () => ({
      ...(isHorizontal
        ? {
            display: 'inline-block',
            lineHeight: token('inputHeightMd') as string,
          }
        : {
            display: 'block',
            marginBottom: 'var(--fe-spacing-xs, 4px)',
          }),
      fontWeight: required ? 'var(--fe-font-weight-semibold, 600)' : 'var(--fe-font-weight-regular, 400)',
      color: token('textPrimary') as string,
    }),
    [required, token, isHorizontal],
  )

  const labelNode = !label ? null : (
    <label className="fe-field-label" style={labelStyle}>
      {required && <span style={{ color: token('error') as string, marginRight: 'var(--fe-spacing-xs, 4px)' }}>*</span>}
      {labelText}
      {tooltip && (
        <span title={tooltip} style={{ marginLeft: 'var(--fe-spacing-xs, 4px)', cursor: 'help', color: token('textTertiary') as string }}>
          ?
        </span>
      )}
    </label>
  )

  const content = (
    <>
      {children}
      {errorMsg && <div style={{ color: token('error') as string, fontSize: token('fontSizeXs') as string, marginTop: token('spacingXs') }}>{errorMsg}</div>}
      {help && !errorMsg && <div style={{ color: token('textTertiary') as string, fontSize: token('fontSizeXs') as string, marginTop: token('spacingXs') }}>{help}</div>}
    </>
  )

  if (!label || !isHorizontal) {
    return (
      <div>
        {labelNode}
        {content}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: token('spacingSm') }}>
      <div style={{ width: `${(labelColSpan / 24) * 100}%`, flexShrink: 0, textAlign: formConfig.labelAlign }}>{labelNode}</div>
      <div style={{ width: `${(wrapperColSpan / 24) * 100}%` }}>{content}</div>
    </div>
  )
})
DefaultFormItem.displayName = 'DefaultFormItem'

// ============================
// 单字段渲染器
// ============================

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
export const FieldRenderer = React.memo(function FieldRenderer({ field, value, onChange, options, disabled, adapter, components = {}, eventContext, errors, formConfig }: FieldRendererProps) {
  // 表达式计算（disabled / required）
  const { exprDisabled, exprRequired } = useFieldExpression(field, value)

  // 判断是否禁用
  const isDisabled = disabled || exprDisabled

  // 判断是否必填
  const isRequired = field.rules?.some((r) => r.required) || exprRequired

  // 通用 props
  const resolvedOptions = useMemo<OptionItem[]>(
    () => (field.mock?.options?.length ? field.mock.options : options.length ? options : field.dataSource?.type === 'static' ? field.dataSource.static.options : []),
    [field.mock?.options, options, field.dataSource],
  )

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
    [value, field, isDisabled],
  )

  const eventHandlers: Record<string, ResolvedEventHandler> = useMemo(
    () => (eventContext ? resolveEvents(field.events, $self, eventContext.$form, eventContext.callbacks, getEventDeclarations(field.type)) : {}),
    [eventContext, field.events, field.type, $self],
  )

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

  // FormItem 选择：adapter.FormItem 优先，否则使用内置 DefaultFormItem
  const FormItemTag = adapter.FormItem ?? DefaultFormItem

  const formItemProps: Omit<FormItemProps, 'children'> = useMemo(
    () => ({
      name: field.name,
      label: isFormComponent(field.type) ? field.label : undefined,
      rules: field.rules,
      required: isRequired,
      validateStatus: errorMsg ? 'error' as const : undefined,
      errors,
      help: field.help,
      tooltip: field.tooltip,
      formConfig,
      scene: adapter.scene,
    }),
    [field.name, field.label, field.type, field.rules, field.help, field.tooltip, isRequired, errorMsg, errors, formConfig, adapter.scene],
  )

  return (
    <div className="fe-field" style={!renderFn ? { padding: 'var(--fe-spacing-sm, 8px) 0', color: 'var(--fe-text-tertiary)' } : undefined}>
      <FormItemTag {...formItemProps}>
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
      </FormItemTag>
    </div>
  )
})
FieldRenderer.displayName = 'FieldRenderer'
