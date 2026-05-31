import React from 'react'
import type { FormFieldSchema, OptionItem } from '../types/schema'
import type { FormAdapter, FieldComponentProps, FieldRendererFn } from '../types/adapter'
import { matchVisibleWhen, evalExpr } from '../utils'

interface FieldRendererProps {
  field: FormFieldSchema
  value: unknown
  onChange: (val: unknown) => void
  options: OptionItem[]
  disabled: boolean
  adapter: FormAdapter
  components?: Record<string, FieldRendererFn>
}

/**
 * 单字段渲染器
 *
 * 组件查找优先级（三层覆盖机制）：
 * 1. adapter[field.type]         — 标准类型映射（如 'input' → InputField）
 * 2. components[componentId]     — 自定义组件注册表（schema.type='custom' 时按 componentId 查找）
 * 3. adapter['default']          — 兜底渲染（避免白屏）
 *
 * 扩展方式：
 *   const myAdapter = { ...antdAdapter, 'tree-select': MyTreeSelect }
 *   <FormRender adapter={myAdapter} />
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  options,
  disabled,
  adapter,
  components = {},
}: FieldRendererProps) {

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

  // label 渲染
  const label = (
    <label className="fe-field-label" style={{ display: 'block', marginBottom: 4, fontWeight: isRequired ? 600 : 400 }}>
      {isRequired && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
      {field.label}
      {field.tooltip && (
        <span title={field.tooltip} style={{ marginLeft: 4, cursor: 'help', color: '#999' }}>?</span>
      )}
    </label>
  )

  // 通用 props
  const fieldProps: FieldComponentProps = {
    value,
    onChange,
    disabled: isDisabled,
    readOnly: field.readOnly,
    placeholder: field.placeholder,
    options: field.mock?.options?.length ? field.mock.options as OptionItem[] : options,
    fieldSchema: field,
    ...field.componentProps,
  }

  /**
   * 查找渲染函数（按优先级）
   */
  const renderFn: FieldRendererFn | undefined =
    // 1. 标准类型映射
    adapter[field.type] ||
    // 2. 自定义组件（按 componentId 查找）
    (field.custom?.componentId ? components[field.custom.componentId] : undefined) ||
    // 3. 兜底
    adapter['default']

  if (!renderFn) {
    // 开发模式下给出明确提示
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[form-engine] 未找到字段 "${field.name}" (type="${field.type}") 的渲染函数，请在 adapter 中补充或提供 adapter['default'] 兜底。`)
    }
    return (
      <div className="fe-field" style={{ padding: '8px 0', color: '#999' }}>
        {label}
        <div style={{ fontSize: 12, color: '#ff4d4f' }}>
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
