import React, { useContext, useMemo } from 'react'
import { ErrorMessage, TooltipIcon } from '../shared/UIPrimitives'
import { type EventContext } from '../events'
import { useStyle } from '../styles'
import type { ComponentRenderFn, FormEngineAdapter, FormItemProps } from '../types/adapter'
import type { FormConfig, FormFieldSchema, OptionItem } from '../types/schema'
import { Text } from '../widgets/Text'
import { AdapterContext } from './AdapterContext'
import { FieldErrorBoundary } from './FieldErrorBoundary'
import { FieldSchemaContext } from './FieldSchemaContext'
import { useInsideContainer } from './InsideContainerContext'
import { useFieldExpression } from './hooks/useFieldExpression'
import { useFieldOptions } from './hooks/useFieldOptions'
import { useFieldProps } from './hooks/useFieldProps'
import { useFormItemProps } from './hooks/useFormItemProps'
import { JsxRender } from './JsxRender'
import { FormEngineContext } from './FormEngineContext'

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
  /** JSX 组件作用域（不传时从 FormEngineContext 读取） */
  jsxScope?: Record<string, unknown>
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
  label,
  labelHidden,
  required,
  validateStatus: _validateStatus,
  errors,
  help,
  tooltip,
  formConfig,
  scene,
  children,
}) {
  const { token } = useStyle()
  const insideContainer = useInsideContainer()
  const isFullWidth = scene === 'mobile' || insideContainer
  const labelColSpan = isFullWidth ? 24 : formConfig.desktop.labelCol.span
  const wrapperColSpan = isFullWidth ? 24 : formConfig.desktop.wrapperCol.span
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

  const labelNode =
    !label || labelHidden ? null : (
      <label className="fe-field-label" style={labelStyle}>
        {required && (
          <span style={{ color: token('error') as string, marginRight: 'var(--fe-spacing-xs, 4px)' }}>*</span>
        )}
        {labelText}
        {tooltip && <TooltipIcon tooltip={tooltip} />}
      </label>
    )

  const content = (
    <>
      {children}
      {errorMsg && <ErrorMessage margin="top">{errorMsg}</ErrorMessage>}
      {help && !errorMsg && (
        <Text type="tertiary" style={{ marginTop: token('spacingXs') }}>
          {help}
        </Text>
      )}
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

  const labelAlign = scene === 'desktop' && !insideContainer ? formConfig.desktop.labelAlign : 'left'

  return (
    <div style={{ display: 'flex', gap: token('spacingSm') }}>
      <div style={{ width: `${(labelColSpan / 24) * 100}%`, flexShrink: 0, textAlign: labelAlign }}>{labelNode}</div>
      <div style={{ width: `${(wrapperColSpan / 24) * 100}%` }}>{content}</div>
    </div>
  )
})
DefaultFormItem.displayName = 'DefaultFormItem'

export { DefaultFormItem }

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
export const FieldRenderer = React.memo(function FieldRenderer({
  field,
  value,
  onChange,
  options,
  disabled,
  adapter,
  components = {},
  eventContext,
  errors,
  formConfig,
  jsxScope: jsxScopeProp,
}: FieldRendererProps) {
  const engineCtx = useContext(FormEngineContext)
  const jsxScope = jsxScopeProp ?? engineCtx?.jsxScope ?? {}
  // 表达式计算（disabled / required）
  const { exprDisabled, exprRequired } = useFieldExpression(field, value)

  // 判断是否禁用
  const isDisabled = disabled || exprDisabled

  // 判断是否必填
  const isRequired = field.rules?.some((r) => r.required) || exprRequired

  // options 解析（4 层优先级）
  const resolvedOptions = useFieldOptions(field, options)

  const errorMsg = errors && errors.length > 0 ? errors[0] : undefined

  // fieldProps 组装（含事件解析、onChange 包装、componentProps 合并）
  const { fieldProps, handleChange } = useFieldProps({
    field,
    value,
    onChange,
    resolvedOptions,
    isDisabled,
    isRequired,
    errorMsg,
    eventContext,
  })

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

  const formItemProps = useFormItemProps({ field, formConfig, isRequired, errorMsg, errors, scene: adapter.scene })

  if (field.type === 'jsx') {
    const compiledCode = (field.componentProps?.compiledCode as string) || ''
    return (
      <FieldErrorBoundary fieldName={field.label || field.name} resetKeys={[field.name, value]}>
        <div className="fe-field">
          <FormItemTag {...formItemProps}>
            <JsxRender
              compiledCode={compiledCode}
              scope={jsxScope}
              componentProps={field.componentProps ?? {}}
              value={value}
              onChange={handleChange}
            />
          </FormItemTag>
        </div>
      </FieldErrorBoundary>
    )
  }

  return (
    <FieldErrorBoundary fieldName={field.label || field.name} resetKeys={[field.name, value]}>
      <div
        className="fe-field"
        style={!renderFn ? { padding: 'var(--fe-spacing-sm, 8px) 0', color: 'var(--fe-text-tertiary)' } : undefined}
      >
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
    </FieldErrorBoundary>
  )
})
FieldRenderer.displayName = 'FieldRenderer'
