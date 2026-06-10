/**
 * Widget 适配层
 *
 * 将 DesignerWidgets 中的组件（ExpressionInput / DataSourceEditor）
 * 适配为统一的 PropertySlotProps 接口。
 *
 * 适配组件在模块作用域定义（而非 render 期创建），规避 React 19
 * "Cannot create components during render" lint 规则。
 */

import React from 'react'
import { FieldDataSource } from '../../types'
import type { DesignerWidgets } from '../../types/adapter'
import type { PropertySlotProps, SlotName } from '../../types/property-slot'

// ── 模块级 widget 引用 ────────────────────────────────────────────
// DesignerWidgets 在应用生命周期内为同一引用，模块级变量安全可⽤。
let _expressionInput: React.ComponentType<any> | null = null
let _dataSourceEditor: React.ComponentType<any> | null = null

// ── 模块级适配组件（不在 render 期内创建） ─────────────────────────

const AdaptedExpressionInput: React.FC<PropertySlotProps> = ({ value, onChange, placeholder, fieldNames }) => {
  const ExpInput = _expressionInput
  if (!ExpInput) return null
  return (
    <ExpInput
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
      fieldNames={fieldNames}
    />
  )
}
AdaptedExpressionInput.displayName = 'AdaptedExpressionInput'

const AdaptedDataSourceEditor: React.FC<PropertySlotProps> = ({ value, onChange, context }) => {
  const DsEditor = _dataSourceEditor
  if (!DsEditor) return null
  return (
    <DsEditor
      value={value as FieldDataSource | undefined}
      onChange={(v) => onChange(v)}
      optionsType={(context?.optionsType as 'flat' | 'tree') ?? 'flat'}
    />
  )
}
AdaptedDataSourceEditor.displayName = 'AdaptedDataSourceEditor'

/**
 * 从 DesignerWidgets 中获取 Widget 层 fallback
 */
export function getWidgetFallback(name: SlotName, widgets?: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!widgets) return null
  switch (name) {
    case 'expressionEditor':
      if (!widgets.ExpressionInput) return null
      _expressionInput = widgets.ExpressionInput
      return AdaptedExpressionInput
    case 'dataSourceEditor':
      if (!widgets.DataSourceEditor) return null
      _dataSourceEditor = widgets.DataSourceEditor
      return AdaptedDataSourceEditor
    default:
      return null
  }
}
