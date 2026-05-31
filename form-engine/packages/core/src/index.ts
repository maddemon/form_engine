/**
 * Form Engine Core - 核心包入口
 * 
 * 功能：
 * 1. 提供标准组件 Props 类型定义
 * 2. 提供默认 HTML 原生组件实现（无需安装任何 adapter 即可使用）
 * 3. 提供组件注册表 API（支持 adapter 覆盖默认组件）
 * 4. 提供 Schema 渲染器
 * 5. 提供设计器（即将迁移）
 * 
 * 使用方式：
 * ```typescript
 * // 方式1：直接使用（默认 HTML 组件）
 * import { FormRender } from '@form-engine/core'
 * 
 * // 方式2：安装 antd adapter 后，自动覆盖默认组件
 * import '@form-engine/adapter-antd' // 自动注册 antd 组件
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
  FormConfig,
  SubmitConfig,
  CustomComponent,
  FieldMock,
  FormRule,
  VisibleWhen,
  FieldDataSource,
  RegisteredComponent,
  RegisteredComponentProp
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
  TimePickerProps,
  UploadProps,
  UploadFile,
  CascaderProps,
  TreeSelectProps,
  ButtonProps,
  TextProps,
  ImageProps,
  DividerProps,
  TitleProps,
  ContainerProps,
  GridProps,
  FlexProps,
  ComponentPropsMap,
  ComponentProps,
  ComponentType
} from './types/component-props'

// 渲染器类型
export type {
  FormRenderProps
} from './renderer/FormRender'

export type {
  FieldRendererProps
} from './renderer/FieldRenderer'

// ============================
// 组件注册表 API
// ============================

export {
  setScene,
  getScene,
  autoDetectScene,
  registerComponent,
  registerComponents,
  getComponent,
  getDesktopComponent,
  getMobileComponent,
  hasComponent,
  clearRegistry,
  type DeviceScene
} from './registry/componentRegistry'

// ============================
// 默认组件（HTML 实现）
// ============================

export {
  // 表单组件
  Input,
  Password,
  TextArea,
  Select,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  InputNumber,
  Slider,
  Rate,
  DatePicker,
  DateRangePicker,
  Upload,
  Switch,
  Button,

  // 布局组件
  Grid,
  Flex,

  // 展示组件
  Text,
  Image,
  Divider,
  Container,
} from './components'

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
export { defaultPaletteGroups as defaultPalette, createFieldFromPalette, generateFieldId } from './designer/FieldList'

export { Designer as FormDesigner } from './designer/Designer'

// 设计器 Hooks（方便开发者自定义设计器）
export {
  useFormDesigner,
  useDesignerScene,
  useDesignerHistory,
  useFieldActions,
} from './designer/hooks'

export type {
  DesignerProps,
} from './types/designer'

// ============================
// 快捷注册函数（供 adapter 使用）
// ============================

/**
 * 注册 adapter 组件
 * 供各 adapter 在 index.ts 中调用
 */
export function registerAdapterComponents(
  components: Record<string, React.ComponentType<any>>,
  scene?: DeviceScene | 'both'
) {
  registerComponents(components, scene)
}

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
