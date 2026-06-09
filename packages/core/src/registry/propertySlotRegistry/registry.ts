/**
 * PropertySlotRegistry 类（纯注册逻辑）
 *
 * 管理属性编辑器 Slot 的注册、查询和清理。
 * 不依赖 React，可独立测试与 tree-shaking。
 */

import type * as React from 'react'
import type { PropertySlotProps, SlotName } from '../../types/property-slot'

export class PropertySlotRegistry {
  private slots = new Map<SlotName, React.ComponentType<PropertySlotProps>>()

  register(name: SlotName, component: React.ComponentType<PropertySlotProps>): void {
    this.slots.set(name, component)
  }

  get(name: SlotName): React.ComponentType<PropertySlotProps> | undefined {
    return this.slots.get(name)
  }

  has(name: SlotName): boolean {
    return this.slots.has(name)
  }

  unregister(name: SlotName): void {
    this.slots.delete(name)
  }

  clear(): void {
    this.slots.clear()
  }
}

export const propertySlotRegistry = new PropertySlotRegistry()
