/**
 * Slot 解析入口
 *
 * 优先级链：运行时注入 > 全局注册 > Widget 兜底 > 核心兜底
 */

import type * as React from 'react'
import type { DesignerWidgets } from '../../types/adapter'
import type { PropertySlotProps, PropertySlots, SlotName } from '../../types/property-slot'
import FallbackCodeEditor from './fallbacks/CodeEditor'
import FallbackDataSourceEditor from './fallbacks/DataSourceEditor'
import FallbackExpressionEditor from './fallbacks/ExpressionEditor'
import FallbackJsonEditor from './fallbacks/JsonEditor'
import { propertySlotRegistry } from './registry'
import { getWidgetFallback } from './widgetAdapters'

/**
 * 核心 fallback 映射
 */
export const defaultSlotFallbacks: Record<SlotName, React.ComponentType<PropertySlotProps>> = {
  expressionEditor: FallbackExpressionEditor,
  dataSourceEditor: FallbackDataSourceEditor,
  jsonEditor: FallbackJsonEditor,
  codeEditor: FallbackCodeEditor,
}

/**
 * 解析 Slot 组件
 *
 * 按优先级链查找：
 * 1. 运行时注入（propsRenderProps.slots.xxx）
 * 2. 全局注册（propertySlotRegistry.get('xxx')）
 * 3. Widget 兜底（w.ExpressionInput / w.DataSourceEditor 等）
 * 4. 核心兜底（defaultSlotFallbacks.xxx）
 */
export function resolveSlot(
  name: SlotName,
  slots?: PropertySlots,
  widgets?: DesignerWidgets,
): React.ComponentType<PropertySlotProps> {
  return (
    slots?.[name] ?? propertySlotRegistry.get(name) ?? getWidgetFallback(name, widgets) ?? defaultSlotFallbacks[name]
  )
}
