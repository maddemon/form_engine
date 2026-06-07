# Props & 类型设计问题修复实施方案

> 基于 `docs/props-type-design-review.md` 的问题分析，制定分阶段渐进式修复方案。
>
> 日期：2026-06-04

---

## 总体策略

- **分 5 个阶段**推进，每阶段独立可验证，降低回归风险
- 每阶段完成后执行 `pnpm build` + `pnpm test`，确保无编译错误和测试回归
- 优先级原则：**类型安全 > 性能 > 代码整洁**；高投入产出比优先
- 每阶段内部按"类型修改 → 消费方适配 → 清理断言"顺序执行

---

## 阶段一：Optional 字段 required 化（消除防御链）

> 目标：消除 `field.id!`（28 处）、`children?.`（10+ 处）等非空断言和防御代码

### 1.1 `FormFieldSchema.id` 改为 required

**文件**: `packages/core/src/types/schema.ts`

```ts
// 修改前
id?: string
// 修改后
id: string
```

**消费方适配**（确保所有创建 FormFieldSchema 的地方都赋值 id）：

| 文件 | 修改点 |
|------|--------|
| `designer/FieldList.tsx` → `createFieldFromPalette()` | 已有 `id: generateFieldId(item.type)`，无需改动 |
| `designer/reducer.ts` → `cloneField()` | 已有 `id: generateFieldId('copy')`，无需改动 |
| `designer/reducer.ts` → `ADD_FIELD` case | 从 `createFieldFromPalette` 获取，id 一定存在 |
| 测试文件中手动构造的 FormFieldSchema | 需补全 id 字段 |

**清理断言**（28 处 `field.id!` → `field.id`）：

| 文件 | 处数 |
|------|------|
| `FieldItem.tsx` | 2 |
| `NestedField.tsx` | 1 |
| `RootFields.tsx` | 1 |
| `PropertyPanel.tsx` | 12 |
| `RulesEditor.tsx` | 1 |
| `reducer.ts` | 2 |
| `ContainerPreview.tsx` | 10 |

### 1.2 `FormFieldSchema.children` 改为 required + 默认 `[]`

**文件**: `packages/core/src/types/schema.ts`

```ts
// 修改前
children?: FormFieldSchema[]
// 修改后
children: FormFieldSchema[]
```

**消费方适配**：

| 文件 | 修改点 |
|------|--------|
| `createFieldFromPalette()` | 容器组件初始化时赋 `children: []` |
| `reducer.ts` → `ADD_FIELD` | 容器字段添加时确保 `children: []` |
| 所有手动构造 FormFieldSchema 的地方 | 非容器组件赋 `children: []`，容器组件赋 `children: [...]` |

**清理防御代码**：

| 写法 | 文件 | 修改 |
|------|------|------|
| `n.children \|\| []` | `reducer.ts` (4 处) | → `n.children` |
| `n.children?.` | `reducer.ts` (2 处) | → `n.children.` |
| `field.children?.` | `ContainerPreview.tsx` (8 处) | → `field.children.` |
| `field.children?.length` | `FormRender.tsx` (1 处) | → `field.children.length` |

### 1.3 `FieldComponentProps.fieldSchema` 改为 required

**文件**: `packages/core/src/types/adapter.ts`

```ts
// 修改前
fieldSchema?: FormFieldSchema
// 修改后
fieldSchema: FormFieldSchema
```

**消费方适配**：

- `FieldRenderer.tsx` 构建 `fieldProps` 时已赋 `fieldSchema: field`，无需改动
- adapter 组件中 `fieldSchema` 的 `?.` 访问可改为直接访问

### 1.4 `FieldComponentProps` 删除冗余 `name`

**文件**: `packages/core/src/types/adapter.ts`

```ts
// 删除
name?: string
```

**影响**：`FieldRenderer.tsx:108-124` 的 `fieldProps` 中不包含 `name`，运行时未传递。删除后不影响运行时行为，但需检查是否有 adapter 组件直接使用 `props.name`（如有，改为 `props.fieldSchema.name`）。

### 1.5 `FieldMock` 去掉索引签名

**文件**: `packages/core/src/types/schema.ts`

```ts
// 修改前
export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
  [key: string]: unknown
}

// 修改后
export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
}
```

**影响**：如果外部代码通过 `mock.xxx` 访问动态属性，需改为类型安全方式。需搜索 `mock[` 和 `mock.` 的所有使用点。

### 1.6 验证步骤

1. `pnpm build` — 编译通过
2. `pnpm test` — 测试通过
3. 全局搜索 `field.id!`、`field.children?.`、`fieldSchema?.` — 应为 0 处
4. 全局搜索 `as any` — 数量应减少（adapter-antd-mobile 的 7 处 `componentProps as any` 不在本阶段范围）

---

## 阶段二：Context 提取（消除 Prop Drilling）

> 目标：将 `NestedFieldRendererProps` 从 10 个 props 降至 2 个（`field` + `onFieldChange`）

### 2.1 新建 3 个 Context

**新建文件**: `packages/core/src/renderer/contexts.ts`

```ts
import { createContext, useContext } from 'react'
import type { FormConfig, OptionItem, EventContext } from '../types'

// ---- FormConfigContext ----
export interface FormConfigContextValue {
  formConfig: FormConfig
}
export const FormConfigContext = createContext<FormConfigContextValue | null>(null)
export function useFormConfig(): FormConfig {
  const ctx = useContext(FormConfigContext)
  if (!ctx) throw new Error('useFormConfig must be used within FormConfigContext.Provider')
  return ctx.formConfig
}

// ---- FormEngineContext ----
export interface FormEngineContextValue {
  adapter: FormEngineAdapter
  components?: Record<string, ComponentRenderFn>
  loading: boolean
}
export const FormEngineContext = createContext<FormEngineContextValue | null>(null)
export function useFormEngine(): FormEngineContextValue {
  const ctx = useContext(FormEngineContext)
  if (!ctx) throw new Error('useFormEngine must be used within FormEngineContext.Provider')
  return ctx
}

// ---- FormStateContext ----
export interface FormStateContextValue {
  formValues: Record<string, unknown>
  fieldOptions: Record<string, OptionItem[]>
  fieldErrors: Record<string, string[]>
}
export const FormStateContext = createContext<FormStateContextValue | null>(null)
export function useFormState(): FormStateContextValue {
  const ctx = useContext(FormStateContext)
  if (!ctx) throw new Error('useFormState must be used within FormStateContext.Provider')
  return ctx
}
```

**设计决策**：
- Context 默认值为 `null`，消费端用 hook + throw 而非 `!` 断言，确保未包裹 Provider 时有明确错误信息
- `FormEngineContext` 合并了 `adapter` + `components` + `loading`（渲染期间不变），减少 Context 数量
- `FormStateContext` 包含 `formValues` + `fieldOptions` + `fieldErrors`（每次输入变化更新）

### 2.2 `FormRender` 注入 Context

**文件**: `packages/core/src/renderer/FormRender.tsx`

在 `FormRender` 组件中包裹 Provider：

```tsx
<FormConfigContext.Provider value={{ formConfig }}>
  <FormEngineContext.Provider value={{ adapter, components, loading }}>
    <FormStateContext.Provider value={{ formValues, fieldOptions, fieldErrors }}>
      {visibleFields.map(field => (
        <NestedFieldRenderer key={field.id} field={field} onFieldChange={handleFieldChange} />
      ))}
    </FormStateContext.Provider>
  </FormEngineContext.Provider>
</FormConfigContext.Provider>
```

### 2.3 简化 `NestedFieldRendererProps`

**文件**: `packages/core/src/renderer/FormRender.tsx`

```ts
// 修改前：10 个 props
interface NestedFieldRendererProps {
  field: FormFieldSchema
  formValues: Record<string, unknown>
  fieldOptions: Record<string, OptionItem[]>
  fieldErrors: Record<string, string[]>
  loading: boolean
  adapter: FormEngineAdapter
  components: Record<string, ComponentRenderFn>
  eventContext: EventContext
  formConfig: FormSchema['form']
  onFieldChange: (name: string, value: unknown) => void
}

// 修改后：2 个 props
interface NestedFieldRendererProps {
  field: FormFieldSchema
  onFieldChange: (name: string, value: unknown) => void
}
```

组件内部通过 `useFormConfig()`、`useFormEngine()`、`useFormState()` 获取数据。

### 2.4 `FieldRenderer` 适配

**文件**: `packages/core/src/renderer/FieldRenderer.tsx`

- 删除 `adapter` prop → 改为 `useFormEngine().adapter`
- 删除 `formConfig` prop → 改为 `useFormConfig()`
- 删除 `components` prop → 改为 `useFormEngine().components`
- `value`/`onChange`/`options`/`disabled` 保留为 props（每个字段不同）
- `eventContext` 保留为 prop（或也进 Context，视后续需要）

### 2.5 `AdapterContext` 统一

**文件**: `packages/core/src/renderer/AdapterContext.ts`

- 现有 `AdapterContext` 保留，但 Provider 改为在 `FormRender` 层注入（而非 `FieldRenderer` 内部）
- `FieldRenderer` 内部不再包裹 `AdapterContext.Provider`
- `useAdapter()` 改为从 `FormEngineContext` 读取

### 2.6 Designer 适配

**文件**: `packages/core/src/designer/NestedField.tsx`

```tsx
// 修改前
const { selectedFieldId, formConfig, adapter } = useDesignerContext()
<FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />

// 修改后：在 Designer 层注入 Context
<FormConfigContext.Provider value={{ formConfig }}>
  <FormEngineContext.Provider value={{ adapter, loading: false }}>
    <FormStateContext.Provider value={{ formValues: {}, fieldOptions: {}, fieldErrors: {} }}>
      <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} />
    </FormStateContext.Provider>
  </FormEngineContext.Provider>
</FormConfigContext.Provider>
```

### 2.7 验证步骤

1. `pnpm build` + `pnpm test`
2. 检查 `NestedFieldRendererProps` 确认只有 2 个 props
3. 检查 `FieldRendererProps` 确认 `adapter`/`formConfig`/`components` 不再是 props
4. 检查 `useMemo` 依赖数组是否简化

---

## 阶段三：componentProps 泛型化（消除 adapter as any）

> 目标：消除 adapter-antd-mobile 的 7 处 `componentProps as any`

### 3.1 `FormFieldSchema` 泛型化

**文件**: `packages/core/src/types/schema.ts`

```ts
// 修改前
export interface FormFieldSchema {
  componentProps?: Record<string, unknown>
  // ...
}

// 修改后
export interface FormFieldSchema<TComponentProps = Record<string, unknown>> {
  componentProps?: TComponentProps
  // ...
}
```

**兼容性**：默认泛型参数 `Record<string, unknown>` 保持向后兼容，现有代码无需改动。

### 3.2 定义各组件的 componentProps 类型

**新建文件**: `packages/core/src/components/component-props.ts`

```ts
export interface InputComponentProps {
  placeholder?: string
  maxLength?: number
  showCount?: boolean
  allowClear?: boolean
}

export interface SelectComponentProps {
  mode?: 'multiple' | 'single'
  showSearch?: boolean
  allowClear?: boolean
}

export interface UploadComponentProps {
  accept?: string
  maxCount?: number
  upload?: (file: File) => Promise<{ url: string }>
}

export interface DatePickerComponentProps {
  showTime?: boolean
  format?: string
}

export interface CheckboxGroupComponentProps {
  direction?: 'horizontal' | 'vertical'
}

export interface RadioGroupComponentProps {
  direction?: 'horizontal' | 'vertical'
}

// ... 其他组件的 componentProps 类型
```

### 3.3 FieldType → ComponentProps 映射

**文件**: `packages/core/src/components/component-props.ts`

```ts
export type ComponentPropsMap = {
  'input': InputComponentProps
  'select': SelectComponentProps
  'multi-select': SelectComponentProps
  'upload': UploadComponentProps
  'date': DatePickerComponentProps
  'datetime': DatePickerComponentProps
  'checkbox': CheckboxGroupComponentProps
  'radio': RadioGroupComponentProps
  // ... 其他映射
}

export type FieldSchemaByType<T extends FieldType> =
  T extends keyof ComponentPropsMap
    ? FormFieldSchema<ComponentPropsMap[T]>
    : FormFieldSchema
```

### 3.4 adapter 组件适配

**以 adapter-antd-mobile 的 Checkbox 为例**：

```tsx
// 修改前
const direction = (fieldSchema.componentProps as any)?.direction

// 修改后
const direction = fieldSchema.componentProps?.direction  // 类型自动推断为 string | undefined
```

**以 adapter-antd-mobile 的 Upload 为例**：

```tsx
// 修改前
const accept = (fieldSchema.componentProps as any)?.accept as string || 'image/*'
const maxCount = ((fieldSchema.componentProps as any)?.maxCount as number) || 5
const userUpload = (fieldSchema.componentProps as any)?.upload as ((file: File) => Promise<{ url: string }>) | undefined

// 修改后
const accept = fieldSchema.componentProps?.accept || 'image/*'
const maxCount = fieldSchema.componentProps?.maxCount || 5
const userUpload = fieldSchema.componentProps?.upload
```

### 3.5 FieldRenderer 中 componentProps 传递适配

**文件**: `packages/core/src/renderer/FieldRenderer.tsx`

当前 `fieldProps` 构建逻辑（约第 108-125 行）将 `componentProps` 展开到 `fieldProps` 中：

```ts
const fieldProps: FieldComponentProps = {
  fieldSchema: field,
  value,
  onChange: wrappedOnChange,
  disabled: isDisabled,
  readOnly: field.readOnly,
  placeholder: field.placeholder,
  ...field.componentProps,       // ← 展开 componentProps
  ...eventHandlers,              // ← 展开事件处理器
}
```

泛型化后，`componentProps` 的类型从 `Record<string, unknown>` 变为具体类型，展开到 `FieldComponentProps` 时需要确保类型兼容。

**方案**：`FieldComponentProps` 去掉 `[key: string]: any` 索引签名后，`componentProps` 的展开需要通过显式字段传递而非展开运算符。但考虑到当前 `componentProps` 的设计意图就是"透传给底层 UI 库"，保留展开但用更安全的类型：

```ts
// FieldComponentProps 保留索引签名，但改为 unknown 而非 any
[key: string]: unknown  // 而非 any
```

这样展开 `componentProps` 时不会丢失类型信息（`unknown` 比 `any` 安全），但 adapter 组件通过 `fieldSchema.componentProps` 访问时有精确类型。

### 3.6 验证步骤

1. `pnpm build` + `pnpm test`
2. 搜索 `componentProps as any` — 应为 0 处
3. 搜索 `as any` — 仅剩 antd 类型不兼容的几处（Button、InputNumber、Alert、Flex 等）

---

## 阶段四：FieldComponentProps 索引签名 & 两套 Props 统一

> 目标：消除 `[key: string]: any`，统一 FieldComponentProps 和 BaseFormComponentProps

### 4.1 `FieldComponentProps` 索引签名 `any` → `unknown`

**文件**: `packages/core/src/types/adapter.ts`

```ts
// 修改前
[key: string]: any

// 修改后
[key: string]: unknown
```

**影响**：所有通过 `props.xxx` 访问的属性返回类型从 `any` 变为 `unknown`。adapter 组件中直接使用 `props.xxx` 的地方需要类型收窄或改为通过 `fieldSchema.componentProps` 访问。

### 4.2 `BaseFormComponentProps.onChange` 从基类移除

**文件**: `packages/core/src/types/base-props.ts`

```ts
// 修改前
export interface BaseFormComponentProps<TValue = any> extends BaseComponentProps {
  onChange?: (value: any) => void
  // ...
}

// 修改后
export interface BaseFormComponentProps<TValue = unknown> extends BaseComponentProps {
  // onChange 由各子接口自行声明
  // ...
}
```

**子接口适配**（已有重写的无需改动，未重写的需补充）：

```ts
// 各子接口自行声明 onChange
export interface UploadProps extends BaseFormComponentProps {
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void
}

export interface CascaderProps extends BaseFormComponentProps {
  onChange?: (value: string[]) => void
}
```

### 4.3 统一两套 Props 的关系

**当前状态**：
- `FieldComponentProps`（adapter.ts）— adapter 组件运行时 props
- `BaseFormComponentProps`（base-props.ts）— 组件类型定义

**目标**：明确两者关系，`FieldComponentProps` 应包含 `BaseFormComponentProps` 的核心字段

```ts
// 方案：FieldComponentProps 继承 BaseFormComponentProps 的核心字段
// 但由于两者使用场景不同（运行时 vs 类型定义），暂不做继承
// 而是在文档中明确两者的职责边界

// FieldComponentProps: adapter 组件运行时接收的 props（含 fieldSchema、索引签名）
// BaseFormComponentProps: 组件类型定义（含 rules、visibleWhen 等声明式配置）
```

**决策**：暂不合并两套接口，但在注释中明确职责边界。合并的改动面太大，收益不足以抵消风险。

### 4.4 验证步骤

1. `pnpm build` + `pnpm test`
2. 搜索 `[key: string]: any` — 应为 0 处
3. 搜索 `onChange?: (value: any)` — 仅在子接口中存在（带具体类型）

---

## 阶段五：注册表统一 & 零散问题修复

> 目标：减少新增组件时的文件修改数（7 → 2），修复零散设计问题

### 5.1 统一组件注册

**新建文件**: `packages/core/src/components/registry.ts`

```ts
export interface ComponentDefinition {
  type: FieldType
  palette: ComponentPalette
  PropsRender?: React.ComponentType<PropsRenderProps>
  eventDeclarations?: EventDeclaration[]
  category: ComponentCategory
}

const registry = new Map<string, ComponentDefinition>()

export function registerComponent(def: ComponentDefinition): void {
  if (registry.has(def.type)) {
    console.warn(`[Form Engine] 组件 "${def.type}" 已注册，将被覆盖。`)
  }
  registry.set(def.type, def)
}

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return registry.get(type)
}

// 从 registry 动态推导
export function getAllPalettes(): Record<string, ComponentPalette> { ... }
export function getPropsRenderMap(): Record<string, React.ComponentType<PropsRenderProps>> { ... }
export function getEventDeclarationMap(): Record<string, EventDeclaration[]> { ... }
export function getComponentCategory(type: string): ComponentCategory { ... }
export function isValidFieldType(type: string): type is FieldType { ... }
```

**各组件目录结构**：

```
components/
  input/
    types.ts          # InputProps
    palette.ts        # ComponentPalette
    Props.tsx         # PropsRender
    events.ts         # EventDeclaration[]
    index.ts          # 统一导出 + registerComponent()
  select/
    ...
```

**各组件的 `index.ts`**：

```ts
import { registerComponent } from '../registry'
import { palette } from './palette'
import PropsRender from './Props'
import { eventDeclarations } from './events'

registerComponent({
  type: 'input',
  palette,
  PropsRender,
  eventDeclarations,
  category: 'form',
})
```

**迁移步骤**：
1. 创建 `registry.ts` 和 `ComponentDefinition` 接口
2. 各组件目录新增 `index.ts`，调用 `registerComponent()`
3. `paletteRegistry.ts` 改为从 registry 读取
4. `propRenders/index.ts` 改为从 registry 读取
5. `components/index.ts` 的 `EVENT_DECLARATION_MAP` 改为从 registry 读取
6. `FieldList.tsx` 的 `isValidFieldType` 改为从 registry 推导
7. 删除 `getComponentCategory` 的硬编码映射

### 5.2 修复 `findInTree` 变量遮盖

**文件**: `packages/core/src/designer/reducer.ts`

```ts
// 修改前（SET_SCHEMA case 内）
const findInTree = (fields: FormFieldSchema[], id: string): boolean =>
  fields.some(f => f.id === id || (f.children && findInTree(f.children, id)))

// 修改后：重命名为 hasFieldInTree，避免遮盖模块级 findInTree
const hasFieldInTree = (fields: FormFieldSchema[], id: string): boolean =>
  fields.some(f => f.id === id || f.children.some(c => hasFieldInTree([c], id)))
  // 同时利用阶段一的 children required 化，去掉 children && 的防御
```

### 5.3 替换 `isValidFieldType` 硬编码白名单

**文件**: `packages/core/src/designer/FieldList.tsx`

```ts
// 修改前：硬编码列表
function isValidFieldType(type: string): type is FieldType {
  const validTypes: FieldType[] = ['input', 'input-number', ...]
  return (validTypes as string[]).includes(type) || type.startsWith('custom:')
}

// 修改后：从 registry 推导
import { isValidFieldType } from '../components/registry'
// 或直接用
function isValidFieldType(type: string): type is FieldType {
  return registry.has(type) || type.startsWith('custom:')
}
```

### 5.4 修复 `EVENT_DECLARATION_MAP` key 不一致

**文件**: `packages/core/src/components/index.ts`

当前 `EVENT_DECLARATION_MAP` 中有 key 不一致：
- `'time-picker'` 应为 `'time'`
- `'date-time'` 应为 `'datetime'`

迁移到 registry 后自动修复（各组件在自己的 `events.ts` 中声明，key 由 `type` 字段决定）。

### 5.5 `EventContext` 语义重叠修复

**文件**: `packages/core/src/events/resolver.ts`

```ts
// 修改前
export interface EventContext {
  formValues: Record<string, unknown>  // ← 与 $form.values 语义重叠
  $form: $Form
  callbacks: Record<string, (...args: any[]) => void>
}

// 修改后：删除 formValues，统一通过 $form.values 访问
export interface EventContext {
  $form: $Form
  callbacks: Record<string, (...args: any[]) => void>
}
```

**消费方适配**：搜索 `eventContext.formValues` 和 `ctx.formValues`，改为 `eventContext.$form.values`。

### 5.6 Designer 预览组件解耦

**新建文件**: `packages/core/src/designer/FieldPreview.tsx`

```tsx
/**
 * 设计器预览用的轻量字段渲染器
 * 只渲染字段静态内容，不处理事件/校验/数据源
 */
export const FieldPreview: React.FC<{ field: FormFieldSchema }> = ({ field }) => {
  const { adapter } = useFormEngine()

  const Renderer = adapter.components[field.type] || adapter.default
  if (!Renderer) return <div>未知组件: {field.type}</div>

  return (
    <Renderer
      fieldSchema={field}
      value={undefined}
      onChange={() => {}}
      disabled={false}
    />
  )
}
```

**文件**: `packages/core/src/designer/NestedField.tsx`

```tsx
// 修改前
import { FieldRenderer } from '../renderer/FieldRenderer'
const content = isContainer
  ? <ContainerPreview field={field} />
  : <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />

// 修改后
import { FieldPreview } from './FieldPreview'
const content = isContainer
  ? <ContainerPreview field={field} />
  : <FieldPreview field={field} />
```

### 5.7 `DesignerContext` adapter 拆分评估

**文件**: `packages/core/src/designer/DesignerContext.ts`

当前 `DesignerContextValue` 同时包含 `adapter` 和 `desktopAdapter`。如果两者实际指向同一对象（大多数场景），无需拆分。如果确实不同，可拆为两个 Context 避免无关重渲染。

**决策**：暂不拆分，先观察实际使用中是否造成性能问题。

### 5.8 验证步骤

1. `pnpm build` + `pnpm test`
2. 新增一个测试组件，验证只需修改 2 个文件（组件目录 + adapter）
3. 搜索 `findInTree` — 应无局部变量遮盖
4. 搜索 `isValidFieldType` — 应无硬编码白名单
5. 搜索 `eventContext.formValues` — 应为 0 处

---

## 风险评估与回退策略

| 阶段 | 风险等级 | 主要风险 | 回退策略 |
|------|---------|---------|---------|
| 一 | 低 | 测试中手动构造的 FormFieldSchema 缺少 id/children | 补全测试数据 |
| 二 | 中 | Context 注入遗漏导致运行时报错 | hook 中 throw 明确错误信息，快速定位 |
| 三 | 中 | 泛型化导致类型推断复杂度增加 | 默认泛型参数保持兼容，渐进迁移 |
| 四 | 中 | 索引签名 any→unknown 导致 adapter 组件编译错误 | 逐文件迁移，每改一个文件即编译验证 |
| 五 | 高 | 注册表迁移涉及所有组件，改动面大 | 保留旧接口作为兼容层，新旧并存过渡 |

## 预期收益

| 指标 | 当前 | 修复后 |
|------|------|--------|
| `field.id!` 非空断言 | 28 处 | 0 处 |
| `as any` 总数 | ~20 处 | ~8 处（仅剩 antd 类型不兼容） |
| `NestedFieldRendererProps` | 10 个 props | 2 个 props |
| 新增组件需修改文件数 | 7 个 | 2 个 |
| `FieldComponentProps` 类型安全 | 索引签名 `any` | 索引签名 `unknown` + componentProps 泛型化 |
