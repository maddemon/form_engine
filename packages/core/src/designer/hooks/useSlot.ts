import { useMemo } from 'react'
import { resolveSlot } from '../../registry/propertySlotRegistry'
import type { DesignerWidgets } from '../../types/adapter-designer'
import type { PropertySlots, SlotName } from '../../types/property-slot'

/**
 * 解析 Slot 组件的 Hook
 *
 * 消除 DefaultPropertyContent / RulesEditor / EventHandlerEditor 中重复的
 * `useMemo(() => resolveSlot(...), [slots, w])` 模式。
 */
export function useSlot(
  name: SlotName,
  slots?: PropertySlots,
  widgets?: DesignerWidgets,
) {
  return useMemo(() => resolveSlot(name, slots, widgets), [name, slots, widgets])
}
