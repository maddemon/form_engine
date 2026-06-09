/**
 * Widget 适配层
 *
 * 将 DesignerWidgets 中的组件（ExpressionInput / DataSourceEditor）
 * 适配为统一的 PropertySlotProps 接口。
 */

import React from 'react'
import { FieldDataSource } from '../../types'
import type { DesignerWidgets } from '../../types/adapter'
import type { PropertySlotProps, SlotName } from '../../types/property-slot'

/** 缓存适配后的组件，避免每次渲染创建新组件类型导致 React 卸载/重挂载 */
const expressionInputCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()
const dataSourceEditorCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()

/** 将 w.ExpressionInput 适配为 PropertySlotProps */
function adaptExpressionInput(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.ExpressionInput) return null
  const cached = expressionInputCache.get(w.ExpressionInput)
  if (cached) return cached
  const ExpressionInput = w.ExpressionInput
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, placeholder, fieldNames }) => (
    <ExpressionInput
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
      fieldNames={fieldNames}
    />
  )
  Adapted.displayName = 'AdaptedExpressionInput'
  expressionInputCache.set(w.ExpressionInput, Adapted)
  return Adapted
}

/** 将 w.DataSourceEditor 适配为 PropertySlotProps */
function adaptDataSourceEditor(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.DataSourceEditor) return null
  const cached = dataSourceEditorCache.get(w.DataSourceEditor)
  if (cached) return cached
  const DataSourceEditor = w.DataSourceEditor
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, context }) => (
    <DataSourceEditor
      value={value as FieldDataSource | undefined}
      onChange={(v) => onChange(v)}
      optionsType={(context?.optionsType as 'flat' | 'tree') ?? 'flat'}
    />
  )
  Adapted.displayName = 'AdaptedDataSourceEditor'
  dataSourceEditorCache.set(w.DataSourceEditor, Adapted)
  return Adapted
}

/**
 * 从 DesignerWidgets 中获取 Widget 层 fallback
 */
export function getWidgetFallback(name: SlotName, widgets?: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!widgets) return null
  switch (name) {
    case 'expressionEditor':
      return adaptExpressionInput(widgets)
    case 'dataSourceEditor':
      return adaptDataSourceEditor(widgets)
    default:
      return null
  }
}
