import React from 'react'
import type { FormFieldSchema, OptionItem } from '../types/schema'
import type { FieldComponentProps } from '../types/adapter'
import { getComponent, getScene } from '../registry/componentRegistry'
import { matchVisibleWhen, evalExpr } from '../utils'

interface FieldRendererProps {
  field: FormFieldSchema
  value: unknown
  onChange: (val: unknown) => void
  options: OptionItem[]
  disabled: boolean
  /**
   * 可选：传入 adapter 作为兜底（兼容旧代码）
   */
  adapter?: Record<string, (props: FieldComponentProps) => React.ReactElement>
  /**
   * 可选：自定义组件（兼容旧代码）
   */
  components?: Record<string, (props: FieldComponentProps) => React.ReactElement>
  /**
   * 场景：'desktop' | 'mobile'，不传则使用全局场景
   */
  scene?: 'desktop' | 'mobile'
}

/**
 * 单字段渲染器（新架构）
 * 
 * 组件查找优先级：
 * 1. components[field.type]     — 自定义组件（兼容旧代码）
 * 2. getComponent(field.type)   — 从注册表获取（新架构）
 * 3. adapter[field.type]        — 从 adapter 获取（兼容旧代码）
 * 4. adapter['default']         — 兜底渲染（兼容旧代码）
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  options,
  disabled,
  adapter,
  components = {},
  scene,
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
   * 查找渲染组件（按优先级）
   */
  
  // 1. 自定义组件（兼容旧代码）
  if (components[field.type]) {
    const renderFn = components[field.type]
    return (
      <div className="fe-field">
        {label}
        {renderFn(fieldProps)}
      </div>
    )
  }
  
  // 2. 从注册表获取（新架构）
  const RegisteredComponent = getComponent(field.type, scene)
  if (RegisteredComponent) {
    return (
      <div className="fe-field">
        {label}
        <RegisteredComponent {...fieldProps} />
      </div>
    )
  }
  
  // 3. 从 adapter 获取（兼容旧代码）
  if (adapter) {
    const renderFn = adapter[field.type] || adapter['default']
    if (renderFn) {
      return (
        <div className="fe-field">
          {label}
          {renderFn(fieldProps)}
        </div>
      )
    }
  }

  // 4. 兜底：未找到组件
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[form-engine] 未找到字段 "${field.name}" (type="${field.type}") 的渲染组件，请注册适配器。`))
  }
  
  return (
    <div className="fe-field" style={{ padding: '8px 0', color: '#999' }}>
      {label}
      <div style={{ fontSize: 12, color: '#ff4d4f' }}>
        未找到组件: {field.type}
      </div>
    </div>
  )
}
