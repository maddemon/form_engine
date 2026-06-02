import React from 'react'
import type { FormFieldSchema, OptionItem } from '../types/schema'
import type { FormEngineAdapter } from '../types/adapter'
import type { $Self, ResolvedEventHandler } from '../types/events'
import { matchVisibleWhen, evalExpr } from '../utils'
import { resolveEvents, type EventContext } from '../events'
import { getEventDeclarations } from '../components'
import { useStyle } from '../styles'
import { isFormComponent } from '../types/component-category'

export interface FieldRendererProps {
  field: FormFieldSchema
  value: unknown
  onChange: (val: unknown) => void
  options: OptionItem[]
  disabled: boolean
  adapter: FormEngineAdapter
  components?: Record<string, (props: any) => React.ReactNode>
  /**
   * 事件上下文（由 FormRender 注入）
   * 不传时事件系统降级为无 events 配置（向后兼容）
   */
  eventContext?: EventContext
}

/**
 * 单字段渲染器
 *
 * 组件查找优先级（三层覆盖机制）：
 * 1. adapter[field.type]         — 标准类型映射（如 'input' → InputField）
 * 2. components[componentId]     — 自定义组件注册表（schema.type='custom' 时按 componentId 查找）
 * 3. adapter['default']          — 兜底渲染（避免白屏）
 *
 * 事件合并优先级（后写覆盖前写）：
 * 内置 props < componentProps < 事件处理器（events 解析结果）
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  options,
  disabled,
  adapter,
  components = {},
  eventContext,
}: FieldRendererProps) {
  const { token } = useStyle()

  // 判断是否禁用
  const isDisabled = disabled ||
    (typeof field.disabled === 'string'
      ? !!evalExpr(field.disabled, { ...({} as Record<string, unknown>), [field.name]: value })
      : false) ||
    (field.disabledIfExpr
      ? !!evalExpr(field.disabledIfExpr, { ...({} as Record<string, unknown>), [field.name]: value })
      : false)

  // 判断是否必填
  const isRequired =
    field.rules?.some(r => r.required) ||
    (field.requiredIfExpr
      ? !!evalExpr(field.requiredIfExpr, { ...({} as Record<string, unknown>), [field.name]: value })
      : false) ||
    (field.requiredWhen ? matchVisibleWhen(field.requiredWhen, { [field.name]: value } as Record<string, unknown>) : false)

  // label 渲染（仅表单组件显示 label）
  const showLabel = isFormComponent(field.type) && field.label
  const label = !showLabel ? null : (
    <label className="fe-field-label" style={{ display: 'block', marginBottom: 'var(--fe-spacing-xs, 4px)', fontWeight: isRequired ? 'var(--fe-font-weight-semibold, 600)' : 'var(--fe-font-weight-regular, 400)' }}>
      {isRequired && <span style={{ color: token('error') as string, marginRight: 'var(--fe-spacing-xs, 4px)' }}>*</span>}
      {field.label}
      {field.tooltip && (
        <span title={field.tooltip} style={{ marginLeft: 'var(--fe-spacing-xs, 4px)', cursor: 'help', color: token('textTertiary') as string }}>?</span>
      )}
    </label>
  )

  // 通用 props
  const resolvedOptions: OptionItem[] =
    field.mock?.options?.length ? field.mock.options as OptionItem[] :
    options.length ? options :
    field.dataSource?.type === 'static' ? field.dataSource.static.options :
    []

  // 解析事件处理器
  const $self: $Self = {
    name: field.name,
    value,
    schema: field,
    props: {
      disabled: isDisabled,
      readOnly: !!field.readOnly,
      placeholder: field.placeholder,
    },
  }
  const eventHandlers: Record<string, ResolvedEventHandler> = eventContext
    ? resolveEvents(
        field.events,
        $self,
        eventContext.$form,
        eventContext.callbacks,
        getEventDeclarations(field.type),
      )
    : {}

  // onChange 包装：先更新当前字段值，再执行用户事件
  // 这样无论用户配置的是 expression / action / callback，
  // 当前字段的 formValues 都会被同步更新
  const handleChange = (newValue: unknown) => {
    onChange(newValue)                          // ① 始终写入 formValues
    eventHandlers.onChange?.(newValue)          // ② 再执行用户事件
  }

  const fieldProps: Record<string, unknown> = {
    value,
    onChange: handleChange,
    disabled: isDisabled,
    readOnly: field.readOnly,
    placeholder: field.placeholder,
    options: resolvedOptions,
    fieldSchema: field,
    ...field.componentProps,            // ③ 透传（优先级：内置 < componentProps）
    ...eventHandlers,                   // ④ 事件处理器最后 spread，最高优先级
  }

  /**
   * 查找渲染函数（按优先级）
   */
  const renderFn: ((props: any) => React.ReactNode) | undefined =
    // 1. 标准类型映射
    (adapter as any)[field.type] ||
    // 2. 自定义组件（按 componentId 查找）
    (field.custom?.componentId ? components[field.custom.componentId] : undefined) ||
    // 3. 兜底
    (adapter as any)['default']

  if (!renderFn) {
    return (
      <div className="fe-field" style={{ padding: `${token('spacingSm')} 0`, color: token('textTertiary') as string }}>
        {label}
        <div style={{ fontSize: token('fontSizeSm') as string, color: token('error') as string }}>
          未知字段类型: {field.type}
        </div>
      </div>
    )
  }

  return (
    <div className="fe-field">
      {label}
      {renderFn(fieldProps)}
    </div>
  )
}
