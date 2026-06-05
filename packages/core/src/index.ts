/**
 * Form Engine Core - 核心包入口
 *
 * 使用方式：
 * ```tsx
 * import { FormRender, useAdaptiveAdapter } from '@form-engine/core'
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
 *
 * // 方式1：显式指定 adapter
 * <FormRender schema={schema} adapter={antdAdapter} />
 *
 * // 方式2：运行时自动检测设备
 * const adapter = useAdaptiveAdapter(antdAdapter, antdMobileAdapter)
 * <FormRender schema={schema} adapter={adapter} />
 *
 * // 方式3：设计/预览手动切换
 * <FormRender adapter={scene === 'mobile' ? antdMobileAdapter : antdAdapter} />
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
  ValidateResult,
  VisibleWhen,
  FormConfig,
  CustomComponent,
  CustomSource,
  FieldMock,
  RegisteredComponent,
  RegisteredComponentProp,
  FieldType,
} from './types/schema'

// 事件类型
export type {
  EventHandler,
  EventHandlerType,
  EventDeclaration,
  EventParamDeclaration,
  FormFieldEvents,
  ResolvedEventHandler,
  EventCallbacks,
  $Self,
  $Form,
} from './types/events'

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
  GridProps,
  FlexProps,
  CollapseProps,
  CollapsePanelConfig,
  TabsProps,
  TabPaneConfig,
  TableProps,
  TableColumnConfig,
  CascaderProps,
  TreeSelectProps,
  CardProps,
  AlertProps,
  SegmentProps,
  TimePickerProps,
  ComponentPropsMap,
  ComponentProps,
  ComponentType,
} from './types/component-props'

// Adapter 类型
export type {
  FormEngineAdapter,
  PropEditorConfig,
  PropertyPanelRenderProps,
  DesignerWidgets,
  FieldRendererFn,
  FieldComponentProps,
  FormWrapperProps,
  FormItemProps,
  ValidateFn,
} from './types/adapter'

// Adapter 值导出（DeviceScene 既是类型也是值）
export {
  type DeviceScene,
} from './types/adapter'

// 渲染器类型
export type {
  FormRenderProps,
  FormRenderHandle,
} from './renderer/FormRender'

export type {
  FieldRendererProps,
} from './renderer/FieldRenderer'

// 设计器类型
export type {
  DesignerProps,
  SidePanelTab,
  SidePanelTabContentProps,
  PropertyPanelTab,
  PropertyPanelTabContentProps,
  PaletteGroup,
  PaletteItem,
} from './types/designer'

// 组件分类
export type {
  ComponentCategory,
} from './types/component-category'
export {
  getComponentCategory,
  isFormComponent,
  isDisplayComponent,
  isContainerComponent,
  isButtonComponent,
  getFormFieldTypes,
  getContainerFieldTypes,
} from './types/component-category'

// 组件事件声明查询
export { getEventDeclarations } from './components'

// 组件注册表
export {
  componentRegistry,
  getComponentLabel,
  getComponentIcon,
  getComponentIconName,
  getComponentDefaultProps,
  ALL_FIELD_TYPES,
  type ComponentRegistration,
} from './components'

// 图标映射（供 adapter 解析图标字符串）
export { iconMap } from './components'

// ============================
// 自定义组件注册 API
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
  FieldSchemaContext,
  useFieldSchema,
  AdapterContext,
  useAdapter,
  useAdaptiveAdapter,
  detectScene,
  useFormRender,
  useVisibility,
  useFormValues,
  useFormValidation,
} from './renderer'

// ============================
// 工具函数
// ============================

export * from './utils'

// ============================
// 事件系统
// ============================

export {
  resolveEventHandler,
  resolveEvents,
  bindEventArgs,
  getActionDef,
  listActionNames,
  invokeAction,
  type EventContext,
  type ActionDef,
} from './events'

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
export { DraggablePaletteItem, type DraggablePaletteItemProps } from './designer/DraggablePaletteItem'
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
  // Theme Bridge 类型（用于 adapter 实现）
  type CssVarMapping,
  type ThemeBridgeConfig,
  type BridgeProviderProps,
} from './styles'
