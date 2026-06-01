/**
 * Form Engine Core - 核心包入口
 * 
 * 功能：
 * 1. 提供标准组件 Props 类型定义
 * 2. 提供组件属性配置（用于属性面板）
 * 3. 提供 Schema 渲染器
 * 4. 提供 Adapter 注册机制
 * 5. 提供设计器
 * 
 * 重要：
 * - 必须安装 adapter 才能使用（不再提供 HTML 兜底）
 * - 支持 antd 和 antd-mobile 两个官方 adapter
 * 
 * 使用方式：
 * ```typescript
 * import { FormRender } from '@form-engine/react'
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * 
 * // 注册 adapter
 * registerAdapter(antdAdapter)
 * 
 * function App() {
 *   return <FormRender schema={schema} />
 * }
 * ```
 */

// ============================
// 类型定义
// ============================

// Schema 类型
export type {
  FormSchema,
  FormFieldSchema,
  OptionItem,
  DataSourceType,
  FieldDataSource,
  FormRule,
  VisibleWhen,
  FormConfig,
  SubmitConfig,
  CustomComponent,
  CustomSource,
  FieldMock,
  RegisteredComponent,
  RegisteredComponentProp,
  FieldType,
} from './types/schema'

// 组件 Props 类型
export type {
  BaseComponentProps,
  BaseFormComponentProps,
  BaseLayoutComponentProps,
  InputProps,
  TextAreaProps,
  InputNumberProps,
  SelectProps,
  RadioProps,
  CheckboxProps,
  SwitchProps,
  SliderProps,
  RateProps,
  DatePickerProps,
  DateRangeProps,
  UploadProps,
  UploadFile,
  ButtonProps,
  TextProps,
  ImageProps,
  DividerProps,
  TitleProps,
  ContainerProps,
  GridProps,
  GridRowConfig,
  GridColConfig,
  FlexProps,
  ComponentPropsMap,
  ComponentProps,
  ComponentType,
} from './types/component-props'

// Adapter 类型
export type {
  FormEngineAdapter,
  PropEditorConfig,
  PropertyPanelRenderProps,
  AdapterTheme,
  DesignerWidgets,
  FieldRendererFn,
  FieldComponentProps,
} from './types/adapter'

// 渲染器类型
export type {
  FormRenderProps,
} from './renderer/FormRender'

export type {
  FieldRendererProps,
} from './renderer/FieldRenderer'

// 设计器类型
export type {
  DesignerProps,
} from './types/designer'

// ============================
// Adapter 注册 API
// ============================

export {
  registerAdapter,
  getAdapter,
  hasAdapter,
  getAdapterComponents,
  getAdapterPropertyPanel,
  clearAdapter,
} from './registry/adapterRegistry'

// ============================
// 组件注册表 API（兼容旧代码，推荐使用 Adapter）
// ============================

export {
  setScene,
  getScene,
  autoDetectScene,
  registerComponent,
  registerComponents,
  registerDesignerWidgets,
  getDesignerWidgets,
  getComponent,
  getDesktopComponent,
  getMobileComponent,
  hasComponent,
  clearRegistry,
  type DeviceScene,
} from './registry/componentRegistry'

// ============================
// 自定义组件注册 API（新增）
// ============================

export {
  registerSimpleCustomComponent,
  registerCustomComponent,
  unregisterCustomComponent,
  type SimpleCustomComponentOptions,
} from './registry/simpleCustomComponentRegistry'

export {
  customComponentRegistry,
  customPropertyWidgetRegistry,
  type CustomComponentRegistry,
  type CustomPropertyWidgetRegistry,
} from './registry/customComponentRegistry'

// 导出自定义组件类型
export type {
  CustomComponentConfig,
  PropertyConfigItem,
  PropertyWidgetType,
  PropertyWidgetProps,
  PropertyWidgetComponentProps,
} from './types/custom-component'

// ============================
// 渲染器
// ============================

export {
  FormRender,
  FieldRenderer,
  defaultAdapter,
} from './renderer'

// ============================
// 工具函数
// ============================

export * from './utils'

// ============================
// 数据源
// ============================

export * from './dataSource/resolver'

// ============================
// 设计器
// ============================

export { Designer } from './designer/Designer'
export { Canvas } from './designer/Canvas'
export { FieldList } from './designer/FieldList'
export { PropertyPanel } from './designer/PropertyPanel'
export { defaultPaletteGroups as defaultPalette } from './designer/paletteData'
export { createFieldFromPalette, generateFieldId } from './designer/FieldList'

export { Designer as FormDesigner } from './designer/Designer'

// 设计器 Hooks（方便开发者自定义设计器）
export {
  useFormDesigner,
  useDesignerScene,
  useDesignerHistory,
  useFieldActions,
} from './designer/hooks'

// ============================
// 样式系统（CSS 变量 & 主题）
// ============================

/**
 * 样式系统 - CSS Variables & Theme Tokens
 * 
 * 使用方式：
 * 
 * 1. 使用 StyleProvider（推荐）
 * ```tsx
 * import { StyleProvider, FormRender } from '@form-engine/core'
 * 
 * function App() {
 *   return (
 *     <StyleProvider theme={{ primary: '#722ed1' }} themeMode="light">
 *       <FormRender schema={schema} />
 *     </StyleProvider>
 *   )
 * }
 * ```
 * 
 * 2. 在组件中使用主题
 * ```tsx
 * import { useStyle } from '@form-engine/core'
 * 
 * function MyComponent() {
 *   const { token, cssVar } = useStyle()
 *   return <div style={{ color: token('primary') }} />
 * }
 * ```
 * 
 * 3. 覆盖 CSS 变量（最简单）
 * 在项目的 CSS 中：
 * ```css
 * :root { --fe-primary: #722ed1; }
 * [data-fe-theme="dark"] { --fe-primary: #1d39c4; }
 * ```
 */

export {
  StyleProvider,
  useStyle,
  useTheme,
  useToken,
  // 类型
  type ThemeTokens,
  type PartialThemeTokens,
  type ThemeMode,
  type SizeMode,
} from './styles'
