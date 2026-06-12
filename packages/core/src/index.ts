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

import { ComponentCategory } from './types/component'

// ============================
// 类型定义
// ============================

// Schema 类型
export type {
  CustomComponent,
  CustomSource,
  DataSourceType,
  FieldDataSource,
  FieldMock,
  FieldType,
  FormConfig,
  FormFieldSchema,
  FormRule,
  FormSchema,
  OptionItem,
  RegisteredComponent,
  RegisteredComponentProp,
  ValidateResult,
  VisibleWhen
} from './types/schema'

// 事件类型
export type {
  $Form,
  $Self,
  EventCallbacks,
  EventDeclaration,
  EventHandler,
  EventHandlerType,
  EventParamDeclaration,
  FormFieldEvents,
  ResolvedEventHandler
} from './types/events'

// 组件 Props 类型

export type {
  AlertProps,
  ButtonProps,
  CardProps,
  CascaderProps,
  CheckboxProps,
  CollapsePanelConfig,
  CollapseProps,
  DatePickerProps,
  DateRangeProps,
  DividerProps,
  FlexProps,
  GridProps,
  HtmlProps,
  ImageProps,
  InputNumberProps,
  InputProps,
  RadioProps,
  RateProps,
  SegmentProps,
  SelectProps,
  SliderProps,
  SubFormColumnConfig,
  SubFormProps,
  SwitchProps,
  TabPaneConfig,
  TabsProps,
  TextAreaProps,
  TextProps,
  TitleProps,
  TreeSelectProps,
  UploadFile,
  UploadProps
} from './components'

// Adapter 类型
export type {
  DesignerWidgets,
  FieldComponentProps,
  FieldRendererFn,
  FormEngineAdapter,
  FormItemProps,
  FormWrapperProps,
  PropEditorConfig,
  PropertyPanelRenderProps,
  ValidateFn
} from './types/adapter'

// Adapter 值导出（DeviceScene 既是类型也是值）
export { type DeviceScene } from './types/adapter'

// 渲染器类型
export type { FormRenderHandle, FormRenderProps } from './renderer/FormRender'

export type { FieldRendererProps } from './renderer/FieldRenderer'

// 设计器类型
export type {
  DesignerProps,
  PaletteGroup,
  PaletteItem,
  PropertyPanelTab,
  PropertyPanelTabContentProps,
  SidePanelTab,
  SidePanelTabContentProps
} from './types/designer'

// 组件分类
export {
  getComponentCategory,
  getContainerFieldTypes,
  getFormFieldTypes,
  isButtonComponent,
  isContainerComponent,
  isDisplayComponent,
  isFormComponent
} from './components'
export type { ComponentCategory }

// 组件事件声明查询
export { getEventDeclarations } from './components'

// 组件注册表
export {
  ALL_FIELD_TYPES,
  componentRegistry,
  getComponentDefaultProps,
  getComponentIcon,
  getComponentIconName,
  getComponentLabel
} from './components'

// 图标映射（供 adapter 解析图标字符串）
export { iconMap } from './components'

// 图标组件（供设计器 & adapter 直接使用）
export { Copy, Grip, Monitor, Smartphone, Trash } from './components/icons'

// ============================
// 自定义组件注册 API
// ============================

export {
  registerCustomComponent,
  registerSimpleCustomComponent,
  unregisterCustomComponent,
  type SimpleCustomComponentOptions
} from './registry/simpleCustomComponentRegistry'

export {
  customComponentRegistry,
  customPropertyWidgetRegistry,
  type CustomComponentRegistry,
  type CustomPropertyWidgetRegistry
} from './registry/customComponentRegistry'

// Property Slot 注册表
export {
  defaultSlotFallbacks,
  propertySlotRegistry,
  PropertySlotRegistry,
  resolveSlot
} from './registry/propertySlotRegistry'

// 导出自定义组件类型
export type {
  CustomComponentConfig,
  PropertyConfigItem,
  PropertyWidgetComponentProps,
  PropertyWidgetProps,
  PropertyWidgetType
} from './types/custom-component'

// Property Slot 类型
export type { PropertySlotProps, PropertySlots, SlotName } from './types/property-slot'

// ============================
// 渲染器
// ============================

export {
  AdapterContext,
  detectScene,
  FieldErrorBoundary,
  FieldRenderer,
  FieldSchemaContext,
  FormRender,
  InsideContainerContext,
  useAdapter,
  useAdaptiveAdapter,
  useFieldSchema,
  useFormRender,
  useFormValidation,
  useFormValues,
  useInsideContainer,
  useVisibility
} from './renderer'

// ============================
// 多国语言
// ============================

export { LocaleProvider, useLocale } from './locale'
export type { LocalePack } from './locale'
export type { SupportedLocale } from './locale/LocaleProvider'

// ============================
// 工具函数
// ============================

// 工具函数
export {
  evalExpr,
  genId,
  getNested,
  matchVisibleWhen,
  pickAdapter,
  replaceTemplateVars,
  resolvePanelWidth,
} from './utils'

// ============================
// 事件系统
// ============================

export {
  bindEventArgs,
  getActionDef,
  invokeAction,
  listActionNames,
  resolveEventHandler,
  resolveEvents,
  type ActionDef,
  type EventContext
} from './events'

// ============================
// 数据源
// ============================

export * from './dataSource/resolver'

// ============================
// 设计器
// ============================

export { Canvas } from './designer/Canvas'
export { Designer } from './designer/Designer'
export { DraggablePaletteItem, type DraggablePaletteItemProps } from './designer/PalettePanel/DraggablePaletteItem'
export { createFieldFromPalette, PalettePanel, generateFieldId } from './designer/PalettePanel'
export { defaultPaletteGroups as defaultPalette } from './designer/data/paletteData'
export { PropertyPanel } from './designer/PropertyPanel'

export { Designer as FormDesigner } from './designer/Designer'

// 设计器 Hooks（方便开发者自定义设计器）
export { useDesignerScene, useFieldActions } from './designer/hooks'

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
  type BridgeProviderProps,
  // Theme Bridge 类型（用于 adapter 实现）
  type CssVarMapping,
  type PartialThemeTokens,
  type SizeMode,
  type ThemeBridgeConfig,
  type ThemeMode,
  // 类型
  type ThemeTokens
} from './styles'

