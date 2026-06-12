/**
 * Widget 适配层
 *
 * 将 DesignerWidgets 中的组件（ExpressionInput / DataSourceEditor）
 * 适配为统一的 PropertySlotProps 接口。
 *
 * 使用 WeakMap 按 DesignerWidgets 对象缓存适配组件，避免模块级变量在多实例场景下互相覆盖。
 * 每个唯一 DesignerWidgets 对象只创建一次适配组件，组件引用保持稳定。
 */

import React from 'react'
import { FieldDataSource } from '../../types'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { PropertySlotProps, SlotName } from '../../types/property-slot'

// ── WeakMap 缓存：按 DesignerWidgets 实例隔离适配组件 ─────────────

const _adapterCache = new WeakMap<DesignerWidgets, Map<SlotName, React.FC<PropertySlotProps>>>()

function getCachedAdapter(
  widgets: DesignerWidgets,
  name: SlotName,
  factory: () => React.FC<PropertySlotProps> | null,
): React.FC<PropertySlotProps> | null {
  let slotMap = _adapterCache.get(widgets)
  if (!slotMap) {
    slotMap = new Map()
    _adapterCache.set(widgets, slotMap)
  }
  if (!slotMap.has(name)) {
    const component = factory()
    if (component) slotMap.set(name, component)
  }
  return slotMap.get(name) ?? null
}

/**
 * 从 DesignerWidgets 中获取 Widget 层 fallback
 */
export function getWidgetFallback(name: SlotName, widgets?: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!widgets) return null

  switch (name) {
    case 'expressionEditor': {
      if (!widgets.ExpressionInput) return null
      return getCachedAdapter(widgets, name, () => {
        const ExpInput = widgets.ExpressionInput
        const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, placeholder, fieldNames }) => (
          <ExpInput
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            placeholder={placeholder}
            fieldNames={fieldNames}
          />
        )
        Adapted.displayName = 'AdaptedExpressionInput'
        return Adapted
      })
    }

    case 'dataSourceEditor': {
      if (!widgets.DataSourceEditor) return null
      return getCachedAdapter(widgets, name, () => {
        const DsEditor = widgets.DataSourceEditor
        const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, context }) => (
          <DsEditor
            value={value as FieldDataSource | undefined}
            onChange={(v) => onChange(v)}
            optionsType={(context?.optionsType as 'flat' | 'tree') ?? 'flat'}
          />
        )
        Adapted.displayName = 'AdaptedDataSourceEditor'
        return Adapted
      })
    }

    default:
      return null
  }
}