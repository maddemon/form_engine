# Props & 类型设计问题分析

> 关注点：可选 props 导致的防御性代码膨胀、冗余 props、应走 Context 却逐层透传的 props、以及其他设计层面的零散问题。
>
> 日期：2026-06-04
>
> 状态标记：✅ 已修复 | ⏳ 延后 | ❌ 待处理

---

## 目录

1. [Optional Props 引发的防御链](#1-optional-props-引发的防御链)
2. [冗余/不必要的 Props](#2-冗余不必要的-props)
3. [应该用 Context 而非 Prop Drilling](#3-应该用-context-而非-prop-drilling)
4. [设计层面的零散问题](#4-设计层面的零散问题)

---

## 1. Optional Props 引发的防御链

类型声明为 optional（`?`），但运行时必然存在。这迫使每一处消费方都要做判空/非空断言，形成"类型说谎 → 防御代码 → 更多类型说谎"的恶性循环。

### 1.1 `FormFieldSchema.id` — schema.ts:133 ✅

```ts
export interface FormFieldSchema {
  id?: string // ← optional
  // ...
}
```

- reducer 生成字段时必定分配 id（`generateFieldId()`）
- 字段进入 state 后 `id` 一定存在
- 但类型说可能是 undefined → 所有消费方被迫：

| 消费方                 | 写法         | 行号                                                  |
| ---------------------- | ------------ | ----------------------------------------------------- |
| `FieldItem.tsx`        | `field.id!`  | 121, 131                                              |
| `NestedField.tsx`      | `field.id!`  | 22                                                    |
| `RootFields.tsx`       | `field.id!`  | 18                                                    |
| `PropertyPanel.tsx`    | `field.id!`  | 86, 91, 93, 95, 97, 103, 135, 180, 183, 214, 239, 248 |
| `RulesEditor.tsx`      | `field.id!`  | 33                                                    |
| `reducer.ts`           | `field.id!`  | 178, 186                                              |
| `ContainerPreview.tsx` | `field.id!`  | 124, 145, 178, 206, 237, 278, 283(×2), 311, 316(×2)   |
| `Canvas.tsx`           | `f.id!`      | —                                                     |
| `RegionPreview.tsx`    | `parent.id!` | —                                                     |

共 **35 处** `.id!` 非空断言（含 `field.id!`、`f.id!`、`parent.id!`）。如果 id 改为 required，全部消除。

### 1.2 `FormFieldSchema.children` — schema.ts:159 ✅

```ts
children?: FormFieldSchema[]  // ← optional
```

容器组件一定有 children（推送时初始化为空数组）。但类型说 optional → 处处防御：

| 消费方                           | 写法                     |
| -------------------------------- | ------------------------ | --- | --- |
| `reducer.ts:insertIntoTree`      | `n.children              |     | []` |
| `reducer.ts:removeFieldFromTree` | `n.children?.`           |
| `ContainerPreview.tsx`           | `field.children?.`       |
| `FormRender.tsx`                 | `field.children?.length` |

如果 `children` 改为 `FormFieldSchema[]`（默认 `[]`），可消除所有 `?.` 和 `|| []`。

### 1.3 `FieldComponentProps.fieldSchema` — adapter.ts:26 → 最大防御链根源 ✅

```ts
export interface FieldComponentProps {
  fieldSchema?: FormFieldSchema // ← optional
  [key: string]: any // ← 索引签名
}
```

这是整个 adapter 层 **`as any` 问题的根源之一**。`fieldSchema` 声明为 optional，但 adapter 组件拿它当唯一数据源。类型系统不承认 → 组件用 `as any` 绕过。

**adapter-antd-mobile：**

| 文件                | 写法                                             | 根因                                                             |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `Checkbox.tsx:7`    | `(fieldSchema.componentProps as any)?.direction` | componentProps 值类型为 unknown                                  |
| `Radio.tsx:7`       | `(fieldSchema.componentProps as any)?.direction` | componentProps 值类型为 unknown                                  |
| `Upload.tsx:6`      | `(fieldSchema.componentProps as any)?.accept`    | componentProps 值类型为 unknown                                  |
| `Upload.tsx:7`      | `(fieldSchema.componentProps as any)?.maxCount`  | componentProps 值类型为 unknown                                  |
| `Upload.tsx:8`      | `(fieldSchema.componentProps as any)?.upload`    | componentProps 值类型为 unknown                                  |
| `Select.tsx:9`      | `(fieldSchema.componentProps as any)?.mode`      | componentProps 值类型为 unknown                                  |
| `DatePicker.tsx:22` | `(fieldSchema.componentProps as any)?.showTime`  | componentProps 值类型为 unknown                                  |
| `Card.tsx:6`        | `(props: any)`                                   | componentProps 展开后类型丢失 + 索引签名无法表达容器组件额外属性 |

**adapter-antd：**

| 文件                    | 写法                               | 根因                           |
| ----------------------- | ---------------------------------- | ------------------------------ |
| `Table.tsx:26`          | `(rest as any).fieldSchema`        | fieldSchema optional           |
| `Button.tsx:31`         | `type={antType as any}`            | antd 类型不兼容                |
| `InputNumber.tsx:43-44` | `formatter as any, parser as any`  | antd 类型不兼容                |
| `Alert.tsx:49`          | `onClose={onClose as any}`         | antd 类型不兼容                |
| `TreeSelect.tsx:28,30`  | `value as any, options as any`     | antd 类型不兼容                |
| `Cascader.tsx:29`       | `options as any`                   | antd 类型不兼容                |
| `Flex.tsx:31-32`        | `justify as any, align as any`     | antd 类型不兼容                |
| `Select.tsx:33`         | `value as any`                     | antd 类型不兼容                |
| `Checkbox.tsx:19`       | `handleChange(checkedValues: any)` | onChange 签名不兼容（见 §2.2） |

> **归因说明**：adapter-antd-mobile 的 7 处 `componentProps as any` 根因是 `componentProps` 声明为 `Record<string, unknown>`，所有值类型都是 `unknown`，读取具体属性必须 `as any`。`Card.tsx:6` 的 `(props: any)` 根因不是 `fieldSchema` optional，而是 `FieldRenderer.tsx:121` 将 `componentProps` 展开后混入组件 props，TypeScript 无法推断这些运行时存在的属性（如 `title`、`columns`、`tabs` 等），开发者只能用 `(props: any)` 绕过。adapter-antd-mobile 中所有容器/展示组件（Card、Segment、Alert、Table、Collapse、Tabs、Grid、Title、Text、Image、Flex、Divider、Container）均使用 `(props: any)`，根因相同。adapter-antd 的 `as any` 多数是 antd 组件 props 类型不兼容。`Checkbox.tsx:19` 的 `checkedValues: any` 是 `onChange` 签名不统一问题（见 §2.2），与 `fieldSchema` optional 无关。

**修复建议：**

1. `fieldSchema` 改为 required（运行时一定存在）
2. 去掉 `[key: string]: any` 索引签名，改用精确扩展接口
3. `componentProps` 改用类型安全的访问器：`getComponentProp<T>(fieldSchema, key, fallback)`
4. **`componentProps` 泛型化**（更彻底的方案）：当前 `componentProps?: Record<string, unknown>` 所有值都是 `unknown`，是 adapter-antd-mobile 7 处 `as any` 的直接根因。可改为泛型约束：

```ts
interface FormFieldSchema<TProps = Record<string, unknown>> {
  componentProps?: TProps
  // ...
}

// 各组件类型声明自己的 props
interface InputComponentProps {
  placeholder?: string
  maxLength?: number
}
type InputFieldSchema = FormFieldSchema<InputComponentProps>
```

这样 adapter 组件拿到的 `componentProps` 就有精确类型，不需要 `as any`。代价是 `FieldType` 需要与 `TProps` 做映射（可用条件类型）。

### 1.4 `FieldComponentProps` 索引签名 — adapter.ts:36 ⏳

```ts
[key: string]: any
```

这个签名让所有 adapter 组件的 props 完全失去类型检查。你在 adapter 组件里写 `props.xxx` 永远不报错，但也永远没有 IDE 提示。

**设计意图**（注释原文）："允许 adapter 透传任意 props 给底层 UI 库组件，索引签名架构设计使然"。

但实际使用中：

- 大多数 prop 是已知的（`value`, `onChange`, `disabled`, `options`, `fieldSchema`）
- 额外 props 应该通过 `componentProps: Record<string, unknown>` 通道，而非污染组件的 props 接口

**修复建议**：定义已知 props 白名单，去掉索引签名。额外 props 统一走 `componentProps`。

> **同类问题**：`BaseComponentProps`（base-props.ts:31）也有 `[key: string]: unknown` 索引签名，与 `FieldComponentProps` 的 `[key: string]: any` 同源。`unknown` 比 `any` 稍安全（至少不允许随意赋值），但同样绕过编译期属性名校验，使得所有显式声明的属性类型形同虚设。

### 1.5 `FormEngineAdapter.components` — adapter.ts:106 ✅

```ts
components: Record<string, FieldRendererFn> // key 可以是任何 string
```

`adapter.components[field.type]` 类型为 `FieldRendererFn | undefined`。但 adapter 应该对声明过的类型有完整覆盖。每个消费方都要做 undefined 检查。

**连带问题**：`adapter.default`（adapter.ts:109）也是 optional，逼出 `FieldRenderer.tsx:146` 的运行时兜底。

**修复建议**：如果类型系统能限制 key 必须是已知的 `FieldType` 子集，可以消除运行时检查。但当前 `FieldType` 是开放联合类型（含 `custom:${string}`），做不到。

### 1.6 `DesignerWidgets` 大量 optional — adapter.ts:120-203 ✅

`TextArea?`、`OptionsEditor?`、`Button?`、`ExpressionInput?` 均标记为可选。

但 `PropertyPanel.tsx:49` 必须用到它们，于是直接强行断言：

```ts
function useWidgets(designerWidgets?: DesignerWidgets) {
  const merged = { ...defaultDesignerWidgets, ...designerWidgets }
  return merged as WidgetsForProps // ← 类型在说谎
}
```

类型说 optional，代码强行 required。`defaultDesignerWidgets` 提供了兜底，这里"保证有值"是对的，但类型系统不承认。

**修复建议**：要么在 `FormEngineAdapter` 层面要求 widgets 全部 required（adapter 提供完整实现），要么定义 `CompleteWidgets` 类型（全部 required）与实际运行的形态匹配，`WidgetsForProps` 即 `CompleteWidgets`。

### 1.7 `PropertyPanelProps.designerWidgets` — PropertyPanel.tsx:33 ✅

```ts
designerWidgets?: DesignerWidgets   // ← optional
```

但内部 `useWidgets` 立即和默认值合并，结果一定是完整的。外部类型说 optional，内部代码强行完整。

**修复建议**：同 1.6，要么 caller required，要么内部类型用 `CompleteWidgets`。

---

## 2. 冗余/不必要的 Props

### 2.1 `FieldComponentProps.name` — adapter.ts:28 ✅

```ts
name?: string
```

与 `fieldSchema.name` 完全重复。所有 adapter 组件要么用 `props.name`，要么用 `props.fieldSchema.name`，两套来源。

**影响**：`FieldRenderer.tsx:108-124` 的 `fieldProps` 中并不包含 `name`，但 adapter 组件的类型中有 `name?`，可能导致一致性问题。

**修复建议**：删除 `name`，强制 adapter 组件读 `fieldSchema.name`。

### 2.2 `BaseFormComponentProps.onChange` — base-props.ts:50 ❌

```ts
export interface BaseFormComponentProps<TValue = any> extends BaseComponentProps {
  onChange?: (value: any) => void
}
```

注释自述问题："onChange 在子接口（如 UploadProps）中被重定义为不同参数签名，无法用 unknown 统一"。

基类类型定义了一个签名，但子类全部重写它。基类的 `onChange` 实际上从未按定义的签名使用。这是**无效抽象**。

**修复建议**：基类不定义 `onChange`，各子接口自行声明。

### 2.3 `FieldRendererProps.options` — FieldRenderer.tsx:17 ❌

```ts
options: OptionItem[]
```

`options` 既可以是 `field.dataSource` 解析结果，也可以是外部注入。但 `FieldRenderer.tsx:77` 已经有处理逻辑：

```ts
const resolvedOptions: OptionItem[] = field.mock?.options?.length ? (field.mock.options as OptionItem[]) : options.length ? options : field.dataSource?.type === 'static' ? field.dataSource.static.options : []
```

**问题**：props 的 `options` 和 schema 中 `field.dataSource` 是两个并行的数据通道，优先级由上述链决定。调用方难以判断到底该传 `options` 还是设置 `dataSource`。

### 2.4 `NestedField.tsx` 的 mock props — NestedField.tsx:27 ❌

```tsx
<FieldRenderer
  field={field}
  value={undefined} // ← 硬编码 mock
  onChange={() => {}} // ← 硬编码 mock
  options={[]} // ← 硬编码 mock
  disabled={false} // ← 硬编码 mock
  adapter={adapter}
  formConfig={formConfig}
/>
```

这是在 **designer** 中渲染预览用的 FieldRenderer。4 个 props 全是 mock 占位。设计器预览并不需要这些运行时数据。

**根因**：`FieldRenderer` 同时服务于 design-time 和 run-time，但没有区分接口。designer 预览其实只需要 `field`、`adapter`、`formConfig` 三个 prop。

**修复建议**：
- 设计器预览用 `FieldRendererPreview` 组件，简化 props（只接受 `field` + `adapter` + `formConfig`，内部 mock 其他值）
- 或让 `FieldRenderer` 的 `value`/`onChange`/`options`/`disabled` 全部 optional，内部提供默认值

### 2.5 `FieldRendererProps` vs `FieldComponentProps` 的 required/optional 不一致 ❌

`FieldRendererProps`（FieldRenderer.tsx:13-30）中 `value`、`onChange`、`options`、`disabled` 全部是 **required**：

```ts
export interface FieldRendererProps {
  value: unknown
  onChange: (val: unknown) => void
  options: OptionItem[]
  disabled: boolean
  // ...
}
```

但 `FieldComponentProps`（adapter.ts:20-37）中这些字段全部是 **optional**：

```ts
export interface FieldComponentProps {
  value?: unknown
  onChange?: (value: unknown) => void
  disabled?: boolean
  // ...
}
```

**问题**：`FieldRenderer` 要求调用方必传，但 adapter 组件接收时可能为 `undefined`。两层接口对同一数据的 required/optional 语义不一致，adapter 组件内部又被迫做判空处理。

**修复建议**：统一两者的 required/optional 语义。如果 `FieldRenderer` 保证传入，`FieldComponentProps` 也应该 required。

---

## 3. 应该用 Context 而非 Prop Drilling

### 3.1 `FieldRendererProps.formConfig` — FieldRenderer.tsx:29 ✅

```ts
formConfig: FormConfig
```

整个表单树共享同一个 `formConfig`。但每层递归都手动传递：

```
FormRender → NestedFieldRenderer → FieldRenderer
                  ↓ (递归子节点)
            NestedFieldRenderer → FieldRenderer
```

**影响**：`formConfig` 是 `NestedFieldRenderer` 9 个 props 之一，导致 `useMemo` 依赖数组膨胀（FormRender.tsx:106），`React.memo` 更易失效。

**修复建议**：建立 `FormConfigContext`，`FormRender` 注入，`FieldRenderer` 直接读取。

### 3.2 `FieldRendererProps.adapter` — FieldRenderer.tsx:19 ✅

```ts
adapter: FormEngineAdapter
```

但 `FieldRenderer.tsx:149` 又在渲染时提供了 `AdapterContext.Provider`：

```tsx
<AdapterContext.Provider value={adapter}>{/* ... */}</AdapterContext.Provider>
```

**同一份数据既当 prop 传，又通过 context 提供**，两套来源。容器子组件（Table/Tabs/Collapse 等）用 `useAdapter()` 读 context，叶子组件用 prop。

**修复建议**：统一走 Context。`FieldRenderer` 不再接收 `adapter` prop，改为 `useAdapter()`。设计器预览时 `NestedField.tsx` 自行包裹 `AdapterContext.Provider`。

### 3.3 `FieldRendererProps.components` — FieldRenderer.tsx:20 ✅

```ts
components?: Record<string, ComponentRenderFn>
```

自定义组件注册表，整个表单树共享。同样逐层透传。

**修复建议**：建 `ComponentsContext`。

### 3.4 `NestedFieldRenderer` 的 10 个 props — FormRender.tsx:84-95 ✅

```ts
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
```

10 个 props 逐层递归传递。其中：

- `formConfig`、`adapter`、`components` — 整树共享，应进 Context
- `formValues`、`fieldOptions`、`fieldErrors` — 全局状态，应进 Context
- `eventContext` — 整树共享，应进 Context
- `loading` — 整树共享，应进 Context

真正每个字段不同的只有 `field` 和 `onFieldChange`。

**根因**：`FormRender.tsx:102` 的 `useMemo` 依赖了 10 个 props，导致任何一个变化就重建所有子节点。`React.memo` 几乎无效。

**修复建议**：提取至少 3 个 Context：

| Context             | 内容                                          | 稳定程度     |
| ------------------- | --------------------------------------------- | ------------ |
| `FormConfigContext` | `formConfig`                                  | 渲染期间不变 |
| `FormEngineContext` | `adapter` + `components` + `loading`          | 渲染期间不变 |
| `FormStateContext`  | `formValues` + `fieldOptions` + `fieldErrors` | 每次输入变化 |

> **性能注意**：`FormStateContext` 每次输入变化都会更新，所有 consumer 都会重渲染。如果字段很多，这会成为性能瓶颈。更优方案是用 `useSyncExternalStore` + selector 模式，让每个字段只订阅自己的值：
>
> ```ts
> const value = useFormState((state) => state.formValues[field.name])
> ```
>
> 或者拆得更细：`FormValuesContext`、`FieldOptionsContext`、`FieldErrorsContext`，各自独立更新。

### 3.5 designer 中的 adapter 传递 — DesignerContext.ts:13-15 ❌

```ts
export interface DesignerContextValue {
  // ...
  adapter: FormEngineAdapter // 画布 adapter
  desktopAdapter: FormEngineAdapter // 属性面板用
}
```

一个 context 同时提供两个 adapter。`NestedField.tsx:18` 只用到 `adapter` 传给 FieldRenderer。`PropertyPanel` 内部又用 `desktopAdapter`。

**问题**：两个 adapter 在同一 context 中，无论哪个变化都触发所有 consumer 重渲染。

**修复建议**：如果这两个 adapter 指向不同对象，考虑拆成两个 context。如果实际指向同一对象（大多数场景），合并为一个。

> **架构不一致**：`DesignerContext` 已用 Context 模式传递 `adapter`/`desktopAdapter`/`formConfig`，避免了 prop drilling。但 `FormRender` 侧同样的 `adapter`/`formConfig` 仍然通过 props 逐层传递（见 §3.1-3.4），两侧架构不一致。

---

## 4. 设计层面的零散问题

### 4.1 三套注册表需要手动同步 ❌

加一个内置组件要修改 3 个文件：

| 注册表           | 文件                                            | 条目数 |
| ---------------- | ----------------------------------------------- | ------ |
| Palette 注册表   | `components/paletteRegistry.ts`                 | 30+    |
| PropsRender 映射 | `propRenders/index.ts`                          | 30+    |
| 事件声明映射     | `components/index.ts` (`EVENT_DECLARATION_MAP`) | 21     |

此外还要更新：

- `FieldType` 联合类型（`schema.ts:96-130`）
- `isValidFieldType` 白名单（`FieldList.tsx:237-246`）
- `getComponentCategory` 映射（`types/component-category.ts`）
- adapter 的 `components` 对象（两个 adapter × 2）

加一个组件触及 **7 个文件**。

**修复建议**：定义一个组件描述对象：

```ts
interface ComponentDefinition {
  type: FieldType
  palette: ComponentPalette
  PropsRender?: React.ComponentType<PropsRenderProps>
  eventDeclarations?: EventDeclaration[]
  category: ComponentCategory
}
```

一个 `registerComponent(definition)` 自动填充所有注册表。

### 4.2 `reducer.ts:255-257` 局部变量遮盖模块级函数 ✅

```ts
case 'SET_SCHEMA': {
  const findInTree = (fields: FormFieldSchema[], id: string): boolean =>  // ← 局部
    fields.some(f => f.id === id || (f.children && findInTree(f.children, id)))
  // ...
}
```

模块级（行 132）已有同名 `findInTree` 返回 `FormFieldSchema | undefined`。局部函数同名但返回 `boolean`，功能类似但不完全相同（模块级返回 field 引用，局部只返回是否存在）。

**风险**：如果有人修改模块级 `findInTree`，不会意识到这里还有一个独立的实现。

### 4.3 `FieldList.tsx:236-246` 硬编码类型白名单 ✅

```ts
function isValidFieldType(type: string): type is FieldType {
  const validTypes: FieldType[] = [
    'input',
    'input-number',
    'textarea',
    'password',
    'select',
    // ... 硬编码列表 ...
  ]
  return (validTypes as string[]).includes(type) || type.startsWith('custom:')
}
```

与 `schema.ts:96` 的 `FieldType` 联合类型不同步。加一个类型就要改两个地方。

**修复建议**：运行时动态推导。`FieldType` 本身就可以做 type guard：

```ts
const ALL_FIELD_TYPES: FieldType[] = ['input', 'input-number' /* ... */]
```

或直接用 `Object.keys(componentPalettes)` 推导。

### 4.4 adapter 组件命名风格不一致

**adapter-antd：**

```
Input, Password, TextArea, Select, Switch, Radio, Checkbox, ...
Container, Grid, Flex, Collapse, Tabs, ...
Text, Image, Divider, Title, Button, ...
```

**adapter-antd-mobile：**

```
InputField, PasswordField, TextAreaField, SelectField, SwitchField,
RadioField, CheckboxField, ...
ContainerField, GridField, FlexField, CollapseField, TabsField, ...
TextField, ImageField, DividerField, TitleField, ButtonField, ...
```

同人不同名。`FieldRenderer.tsx:130-136` 的组件查找逻辑对两者都能工作（按 `field.type` 索引），但导入/导出时命名不一致增加认知负担。

### 4.5 `EventDeclaration/EventContext` 在 renderer 和 events 间耦合 ✅

**renderer/hooks/useFormRender.ts:99-103：**

```ts
const eventContext: EventContext = useMemo(() => ({ formValues, $form, callbacks }), [$form, callbacks])
```

`EventContext` 定义在 `events/index.ts`，包含 `formValues`、`$form`、`callbacks`。但 `$form` 本身已经包含 `formValues`（通过 getter），`EventContext` 又额外带 `formValues` 字段，语义重叠。

**更严重的问题**：`useMemo` 的依赖数组中**没有 `formValues`**（只有 `$form` 和 `callbacks`），代码用 `eslint-disable-next-line` 压制了 lint 警告。这意味着 `eventContext.formValues` 可能是**过期的**——当 `formValues` 变化时，`eventContext` 不会重新创建，事件处理器中直接访问 `eventContext.formValues` 读到的是旧值。通过 `$form.values` 访问则不受影响（getter 读 `formValuesRef.current`）。

**修复建议**：将 `formValues` 加入 `useMemo` 依赖数组，或从 `EventContext` 中移除 `formValues`（统一通过 `$form.values` 访问）。

### 4.6 Designer 中 NestedField 使用 FieldRenderer 的跨层耦合

`NestedField.tsx:4`：

```ts
import { FieldRenderer } from '../renderer/FieldRenderer'
```

designer 模块依赖 renderer 模块。`FieldRenderer` 是为表单运行时设计的（含 `value`、`onChange`、`options` 等），但在 designer 预览中只用来展示静态占位。

**后果**：`FieldRenderer` 不能轻易重构（hooks 顺序、props 接口），因为会被 designer 模块影响。两个模块有了隐式耦合。

**修复建议**：designer 预览用轻量 `FieldPreview`，只渲染字段静态内容，不处理事件/校验/数据源。

### 4.7 `FieldComponentProps` vs `BaseFormComponentProps` 两个基类接口

两套基础 props 定义：

| 接口                     | 文件                  | 用途                                 |
| ------------------------ | --------------------- | ------------------------------------ |
| `FieldComponentProps`    | `types/adapter.ts`    | adapter 组件收到的实际 props         |
| `BaseFormComponentProps` | `types/base-props.ts` | 组件类型定义（Props.tsx 的类型声明） |

两者语义重叠但定义独立。`FieldComponentProps` 有 `fieldSchema` + 索引签名，`BaseFormComponentProps` 有 `value`/`onChange`/`rules`/`visibleWhen`。

**问题**：这两者的关系不清晰。adapter 组件收到的 props 应该是从 `BaseFormComponentProps` 派生而来，但实际上是独立的。

### 4.8 `simpleCustomComponentRegistry.ts` 中的 `: any` 类型注解

```ts
// 实际代码中是参数类型注解中的 any，而非 as any 断言
_component: React.ComponentType<any> // ← : any 类型注解
```

该文件中没有 `as any` 断言，但 `React.ComponentType<any>` 使得自定义组件的 props 完全失去类型检查。与 `FieldComponentProps` 的 `[key: string]: any` 问题类似，都是通过 `any` 放弃类型安全。

### 4.9 `FieldRenderer.tsx:77` — `field.mock.options` 的 `as` 转换 ✅

```ts
field.mock?.options?.length ? (field.mock.options as OptionItem[]) :
```

`field.mock` 类型为 `FieldMock`，其中 `options` 定义为 `OptionItem[]`（`schema.ts:88`）。乍看之下 `as OptionItem[]` 多余，但 `FieldMock` 还有索引签名：

```ts
export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
  [key: string]: unknown // ← 索引签名
}
```

索引签名 `[key: string]: unknown` 可能导致 `options` 属性的推断类型被收窄为 `unknown`（而非声明的 `OptionItem[]`），此时 `as OptionItem[]` 是必要的。需要实际编译验证。如果 TS 能正确区分具体属性与索引签名，则 `as` 多余；否则不多余。

**根因**：`FieldMock` 的索引签名与具体属性类型冲突，与 `FieldComponentProps` 的 `[key: string]: any` 问题同源。修复方式：去掉 `FieldMock` 的索引签名，或改用交叉类型：

```ts
// 方案 1：去掉索引签名
export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
}

// 方案 2：交叉类型（保留扩展能力）
export type FieldMock = {
  formValue?: unknown
  options?: OptionItem[]
} & Record<string, unknown>
```

### 4.10 `FormConfig.scenes` 解构后断言 — FieldRenderer.tsx:175 ✅

```ts
textAlign: (formConfig.labelAlign || 'right') as 'left' | 'right'
```

`formConfig.labelAlign` 类型已经是 `'left' | 'right'`（`schema.ts:174`）。这里的 `as 'left' | 'right'` 是多余的。

### 4.11 `FieldMock` 索引签名削弱具体属性的类型约束 ✅

```ts
export interface FieldMock {
  formValue?: unknown
  options?: OptionItem[]
  [key: string]: unknown // ← 索引签名与具体属性冲突
}
```

与 `FieldComponentProps` 的 `[key: string]: any` 问题同源。索引签名要求所有属性的值类型必须兼容 `unknown`，而 `options?: OptionItem[]` 的 `OptionItem[]` 是 `unknown` 的子类型，所以 TS 不报错。但实际效果是：通过索引签名访问 `mock.options` 时返回 `unknown`，而非 `OptionItem[] | undefined`，削弱了类型约束。

### 4.12 `componentProps?: Record<string, unknown>` 的值类型丢失 ❌

```ts
// schema.ts
componentProps?: Record<string, unknown>
```

`componentProps` 声明为 `Record<string, unknown>`，所有值都是 `unknown`。adapter 组件从 `componentProps` 读取特定属性（如 `direction`、`accept`、`maxCount`）时，必须 `as any` 或 `as string`。这是 adapter-antd-mobile 7 处 `componentProps as any` 的**直接根因**（见 §1.3 归因说明）。

**双重类型丢失链**：`FieldRenderer.tsx:121` 将 `componentProps` 展开后混入 `fieldProps`（`...field.componentProps`），所有键值对以 `unknown` 类型进入 `fieldProps: Record<string, unknown>`，再通过 `FieldComponentProps` 的 `[key: string]: any` 索引签名传给 adapter 组件。这意味着 schema 层的类型信息在传递到组件时**经过两次丢失**：`Record<string, unknown>` → 展开 → `Record<string, unknown>` → 索引签名 → `any`。这是 adapter-antd-mobile 所有容器/展示组件使用 `(props: any)` 的根因。

**修复建议**：见 §1.3 修复建议第 4 点——`componentProps` 泛型化。

### 4.13 `FormFieldSchema` 其他高频 optional 字段未分析

文档聚焦于 `id` 和 `children`，但 `FormFieldSchema` 还有大量 optional 字段在运行时也"几乎一定存在"：

| 字段              | 声明     | 运行时                | 影响                                     |
| ----------------- | -------- | --------------------- | ---------------------------------------- |
| `componentProps?` | optional | reducer 初始化为 `{}` | adapter 组件读取时需要 `?.` 或 `!`       |
| `label?`          | optional | 大多数字段有 label    | PropertyPanel 需要 `field.label \|\| ''` |
| `placeholder?`    | optional | 表单组件通常有        | adapter 组件需要 `?.`                    |

这些字段的 optional 导致的防御代码虽然不如 `id` 那么密集，但同样是"类型说谎"的体现。建议在修复 `id` 和 `children` 时一并评估。
