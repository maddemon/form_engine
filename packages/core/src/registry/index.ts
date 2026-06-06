/**
 * 注册表统一导出
 */

// 自定义组件注册表
export {
  customComponentRegistry,
  customPropertyWidgetRegistry,
  type CustomComponentRegistry,
  type CustomPropertyWidgetRegistry,
} from './customComponentRegistry'

// 简化注册 API
export {
  registerSimpleCustomComponent,
  registerCustomComponent,
  unregisterCustomComponent,
  type SimpleCustomComponentOptions,
} from './simpleCustomComponentRegistry'

// Property Slot 注册表
export {
  propertySlotRegistry,
  resolveSlot,
  defaultSlotFallbacks,
  PropertySlotRegistry,
} from './propertySlotRegistry'
