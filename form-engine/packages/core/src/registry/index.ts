/**
 * 注册表统一导出
 */

// 组件注册表（原有）
export {
  registerComponent,
  registerComponents,
  getComponent,
  getDesktopComponent,
  getMobileComponent,
  hasComponent,
  clearRegistry,
  getRegisteredTypes,
  hasAnyComponent,
  setScene,
  getScene,
  autoDetectScene,
  registerDesignerWidgets,
  getDesignerWidgets,
  type DeviceScene,
} from './componentRegistry'

// 自定义组件注册表（新增）
export {
  customComponentRegistry,
  customPropertyWidgetRegistry,
  type CustomComponentRegistry,
  type CustomPropertyWidgetRegistry,
} from './customComponentRegistry'

// 简化注册 API（新增）
export {
  registerSimpleCustomComponent,
  registerCustomComponent,
  unregisterCustomComponent,
  type SimpleCustomComponentOptions,
} from './simpleCustomComponentRegistry'
