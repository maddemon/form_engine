import type { FormFieldSchema, FormSchema, OptionItem } from './schema'

/**
 * DataSourceResolver
 * 使用者传入，决定如何解析 dataSource.config 获取数据
 */
export type DataSourceResolver = (
  config: Record<string, unknown>,
  context: DataSourceContext
) => Promise<OptionItem[]> | OptionItem[]

export interface DataSourceContext {
  fieldName: string
  formValues: Record<string, unknown>
  fieldSchema: FormFieldSchema
  formSchema: FormSchema | Record<string, unknown>
}

/**
 * DataSourceEditor Props
 * 使用者传入的 ReactNode 的 props 协议
 */
export interface DataSourceEditorProps {
  config: Record<string, unknown>
  onChange: (newConfig: Record<string, unknown>) => void
  field: FormFieldSchema
  formSchema: Record<string, unknown>
}

/**
 * CustomComponents
 * 使用者在开发阶段注册的自定义组件
 */
export type CustomComponents = Record<string, React.ComponentType<CustomComponentProps>>

export interface CustomComponentProps {
  value?: unknown
  onChange?: (value: unknown) => void
  disabled?: boolean
  readOnly?: boolean
  [key: string]: unknown
}

/**
 * FormRender Props
 */
export interface FormRenderProps {
  schema: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  components?: CustomComponents
  initialValues?: Record<string, unknown>
  loading?: boolean
}
