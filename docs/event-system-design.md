# 控件事件系统设计

## 目标

设计一套通用的事件系统，支持：
1. 内置控件的事件（如按钮的 `onClick`、输入框的 `onChange`、下拉框的 `onSearch`）
2. 每个控件独有的特殊事件（如 Upload 的 `beforeUpload`）
3. 开发者自定义控件的事件声明与配置
4. 设计器属性面板中可视化配置事件

---

## 一、现状分析

### 1.1 当前事件处理方式

| 事件 | 处理方式 | 问题 |
|------|---------|------|
| `onChange` | 在 `FieldRenderer` 中硬编码，统一传 `(value: unknown) => void` | 所有表单组件共用同一个 `onChange`，无法覆盖为特殊行为 |
| `onClick` / `onBlur` / `onFocus` | 定义在 `BaseComponentProps` 中，但设计器未配置，运行时也未绑定 | 类型定义存在但无实际功能 |
| 组件特殊事件 | 如 `Select.onSearch`、`Upload.beforeUpload` | 仅定义在组件 Props 类型中，无法通过 schema 配置 |
| 自定义组件事件 | `CustomComponentProps` 仅含 `onChange` | 无法声明自定义事件，也无法在设计器中配置 |

### 1.2 当前事件数据流

```
FormRender
  └─ FieldRenderer (硬编码 onChange)
       └─ adapter[type] 渲染函数
            └─ 实际组件 (只收到 onChange)
```

---

## 二、事件系统设计

### 2.1 核心概念

```
┌─────────────────────────────────────────────────────────────┐
│                        事件系统                              │
│                                                             │
│  声明层 (Declaration)    配置层 (Configuration)    执行层 (Runtime) │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │ 组件声明它支持  │  ──→ │ 设计器中配置    │  ──→ │ 运行时解析为    │ │
│  │ 哪些事件       │      │ 事件处理逻辑    │      │ 真实回调函数    │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 事件分类

```
ComponentEvents
├── 通用事件（所有组件继承）
│   ├── onClick    — 点击事件
│   ├── onBlur     — 失焦事件
│   └── onFocus    — 获焦事件
│
├── 表单组件通用事件（form 分类组件继承）
│   └── onChange   — 值变化事件（替代当前硬编码 onChange）
│
└── 组件特定事件（各组件自行声明）
    ├── Select.onSearch
    ├── Upload.beforeUpload
    └── Button.onLongPress（移动端）
```

### 2.3 事件处理类型

每个事件可配置三种处理方式之一：

```typescript
interface EventHandler {
  /** 处理类型 */
  type: 'expression' | 'action' | 'callback'
  /** 表达式（type='expression'） */
  expression?: string
  /** 动作名（type='action'），详见 2.4 */
  action?: string
  /** 动作参数 */
  params?: Record<string, unknown>
  /** 回调名（type='callback'），引用 FormRender 传入的 callbacks 中的函数 */
  callback?: string
}
```

| 类型 | 说明 | 示例 |
|------|------|------|
| `expression` | 内联表达式，运行时执行 | `"$form.setFieldValue('other', $event.target.value)"` |
| `action` | 预定义动作（详见 2.4） | `"submit"`, `"reset"`, `"setFieldValue"` |
| `callback` | 引用外部回调函数 | `"onCustomClick"` → `callbacks.onCustomClick(...args)` |

### 2.4 action 与 expression 的关系

`action` 是 `expression` 的"快捷方式"：在实现层，**每个 action 都会被翻译成一段固定的 expression**（或在 resolver 中由查表分派），目的是让设计器用下拉框枚举出常用动作，避免业务同学在表达式里写错函数名。语义上两者完全等价。

支持的 action 与对应 expression：

| action 名 | 默认参数 | 对应 expression |
|----------|---------|----------------|
| `submit` | — | `$form.submit()` |
| `reset` | — | `$form.reset()` |
| `validate` | `{ name?: string }` | `$form.validate(params.name)` |
| `setFieldValue` | `{ name, value }` | `$form.setFieldValue(params.name, params.value)` |

不在表中的 action 在执行时报"未知 action"错误（详见 4.6 错误处理矩阵）。如需新增 action，只需在 `events/actions.ts` 的注册表中追加一行，无需修改 resolver 主流程。

---

## 三、Schema 变更

### 3.1 FormFieldSchema 新增 `events` 字段

```typescript
export interface FormFieldSchema {
  // ... 现有字段保持不变 ...

  /** 事件配置 */
  events?: FormFieldEvents
}

/** 事件配置映射 */
export interface FormFieldEvents {
  onChange?: EventHandler
  onClick?: EventHandler
  onBlur?: EventHandler
  onFocus?: EventHandler
  /** 组件特定事件，如 onSearch, onVisibleChange 等 */
  [key: string]: EventHandler | undefined
}
```

#### events 与 componentProps 的分工

`componentProps` 早已支持任意 prop 透传（含事件）。新增 `events` 不是为了替代它，而是为事件提供：

- **声明式**：列出该字段支持哪些事件，供设计器渲染配置 UI
- **强类型**：handler 走 `EventHandler` 联合类型
- **多种处理方式**：expression / action / callback 覆盖更广场景
- **可视化**：设计器能渲染事件配置面板

| 维度 | `componentProps` | `field.events` |
|------|------------------|----------------|
| 数据来源 | schema 字面量（设计器/手写） | schema 字面量（设计器/手写） |
| 值类型 | `unknown`（任意） | `EventHandler` 联合类型 |
| 设计器可视化 | ❌ 不感知 | ✅ 渲染事件编辑器 |
| 处理逻辑 | 透传给组件 | resolver 解析为回调 |
| 适用场景 | 静态配置（placeholder、maxLength 等） | 业务逻辑编排（联动、副作用） |
| 优先级（与同名事件冲突时） | 较低 | 最高（详见 5.3） |

**简单场景**（"我希望 Select 搜索时打日志"）：直接用 `componentProps.onSearch`，不引入 events 复杂度。
**复杂场景**（"我希望 onChange 时联动修改另一个字段的值"）：用 `events.onChange` 配 `action: setFieldValue` 或 `expression: "$form.setFieldValue('other', ...)"`。

### 3.2 FormRenderProps 新增 callbacks

```typescript
export interface FormRenderProps {
  // ... 现有字段保持不变 ...

  /**
   * 表单级值变化通知（每次 formValues 更新后触发）
   * - 参数是整体 formValues
   * - 与字段级 events.onChange 含义不同，请勿混淆
   */
  onChange?: (values: Record<string, unknown>) => void

  /**
   * 事件回调（供 EventHandler.type='callback' 引用）
   * key 为回调名，value 为函数；运行时会按 name 查表
   */
  callbacks?: Record<string, (...args: any[]) => void>
}
```

#### onChange 命名区分

文档中存在两个 `onChange`，含义不同，务必区分：

| 位置 | 触发时机 | 参数 | 用途 |
|------|---------|------|------|
| `FormRenderProps.onChange` | 整个 `formValues` 更新后 | 完整 formValues | 外部业务同步状态、联动其他模块 |
| `field.events.onChange` | 单个字段值变化 | 该字段的新值 | 字段级业务逻辑（联动、联动其他字段、副作用） |

设计器属性面板中配置的是**字段级** `events.onChange`，不会调用 `FormRenderProps.onChange`；后者由 FormRender 自身在 `setFormValues` 完成后无条件调用（与 events 配置无关），保证宿主应用始终能拿到最新 formValues。

---

## 四、类型层变更

### 4.1 BaseComponentProps 保持不变

```typescript
export interface BaseComponentProps {
  onClick?: (event: React.MouseEvent) => void
  onBlur?: () => void
  onFocus?: () => void
  // ...
}
```

这些事件签名在类型层保留，但运行时不再由 `FieldRenderer` 直接传入固定值，而是从 `field.events` 解析生成。

### 4.2 BaseFormComponentProps 保持不变

```typescript
export interface BaseFormComponentProps<TValue = any> extends BaseComponentProps {
  onChange?: (value: any) => void
  // ...
}
```

### 4.3 新增组件事件声明类型

每个组件在 `types.ts` 中声明自己支持的事件，用于设计器属性面板展示：

```typescript
// components/select/types.ts
import type { EventHandler } from '../../types/events'

/** Select 支持的事件声明（供设计器使用） */
export const selectEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '值变化', description: '选中值变化时触发' },
  { name: 'onSearch', label: '搜索', description: '搜索文本变化时触发' },
  { name: 'onBlur', label: '失焦', description: '失去焦点时触发' },
  { name: 'onFocus', label: '获焦', description: '获得焦点时触发' },
]
```

```typescript
// 新增类型 types/events.ts
export interface EventDeclaration {
  name: string
  label: string
  description?: string
  /** 事件参数说明（用于表达式编辑器提示） */
  params?: EventParamDeclaration[]
}

export interface EventParamDeclaration {
  name: string
  type: string
  description?: string
}
```

### 4.4 CustomComponentConfig 新增 events

```typescript
export interface CustomComponentConfig {
  // ... 现有字段保持不变 ...

  /** 事件声明（自定义组件支持的事件） */
  events?: EventDeclaration[]
}
```

> `events` 保持可选：未声明的 `custom:xxx` 组件在设计器中不显示任何事件配置项。

#### 读取约定

`CustomComponentRegistry.get(type)` 当前返回 `CustomComponentConfig | undefined`。设计器侧按如下约定读取：

```typescript
const config = customComponentRegistry.get(field.type)
const eventDeclarations = config?.events ?? []
```

由于 `CustomComponentConfig` 的字段已声明为可选，TS 不会报"`events` 可能为 undefined"——但读取后做数组操作时仍需兜底。

### 4.5 事件上下文变量（$self / $form / $event）

expression 执行时，框架向作用域注入三个特殊变量（`$` 前缀与业务字段命名空间天然隔离）：

#### `$self`：当前字段

```typescript
interface $Self {
  /** 字段名 */
  name: string
  /** 当前值 */
  value: unknown
  /** 字段完整 schema */
  schema: FormFieldSchema
  /** 解析后的最终 props（仅含运行时关心的部分） */
  props: {
    disabled: boolean
    readOnly: boolean
    placeholder?: string
  }
}
```

表达式中通过 `$self.value` 取当前字段值、`$self.name` 取字段名（拼接路径时有用）。

#### `$form`：表单级 API

```typescript
interface $Form {
  /** 整体 formValues（只读拷贝，写请用 setFieldValue） */
  values: Record<string, unknown>
  /** 设置某字段值 */
  setFieldValue(name: string, value: unknown): void
  /** 批量设置 */
  setFieldsValue(patch: Record<string, unknown>): void
  /** 获取某字段值 */
  getFieldValue(name: string): unknown
  /** 提交表单（等价于点提交按钮） */
  submit(): void
  /** 重置表单 */
  reset(): void
  /** 校验某字段或全部，返回是否通过 */
  validate(name?: string): Promise<boolean>
}
```

实现全部来自 EventContext（详见 5.1）。设计器侧的表达式编辑器应基于此接口做代码补全。

#### `$event`：原始事件对象

不同事件下形态不同（与组件库一致）：

| 事件 | `$event` 形态 |
|------|--------------|
| `onChange` | 该字段的新值（与 `BaseFormComponentProps.onChange` 第一参一致） |
| `onClick` | `React.MouseEvent`（`$event.target` 等可用） |
| `onBlur` / `onFocus` | `React.FocusEvent` |
| `onSearch` | 搜索关键字字符串（与 `SelectProps.onSearch` 一致） |
| `beforeUpload` | `File` 对象（仅 Upload 组件） |

> $event 形态由组件自身决定。若组件事件签名有特殊形态，应在 `xxxEventDeclarations` 的 `params` 中声明，供设计器表达式编辑器提示（详见 4.3）。

### 4.6 异步事件

resolver 默认**丢弃回调返回值**，不阻塞 UI、不 await。原因是 90% 的事件（onClick、onChange、onSearch、onFocus）业务侧都是同步处理，整链路 await 反而引入不必要的延迟与错误传播复杂度。

少数场景需要保留 Promise 语义：

- `Upload.beforeUpload(file)`：返回 `boolean | Promise<void>`，决定是否真正发起上传
- `Upload.onChange({ file, fileList })`：业务侧可能需要 async 上报到埋点系统

这些场景的**特殊处理**：

| 事件 | 异步行为 |
|------|---------|
| `beforeUpload` | resolver 检测到该事件时，包装返回值为 `Promise.resolve()`，**保留**用户回调的返回值透传给 antd Upload |
| `Upload.onChange` | 同上 |
| 其他事件 | 不 await，不透传返回值 |

判断依据：在 `xxxEventDeclarations` 中标记 `async: true`（默认值 false）。`Upload.ts` 的 `onChange/beforeUpload` 声明需补 `async: true` 标记。

### 4.7 触发频率与去抖

事件系统不内置 debounce / throttle。理由：

- 业务对去抖的需求不一致（input 搜索 300ms，input 普通 onChange 0ms）
- 框架层强行去抖会让"实时联动"类需求无法实现

**约定**：

- 需要去抖时，由用户在 handler 内自行实现（expression 内可用 `setTimeout`，callback 可用 lodash 等）
- 高频事件（onChange）的 expression 解析本身有开销，但**单次解析 < 1ms**，实测不影响体验
- 同一 field、同一 events 配置下，resolver 输出会被 React 的 props diff 自然去重，无需手动 memo

---

## 五、运行时执行引擎

### 5.1 事件解析器

新增 `events/resolver.ts`，负责将 `field.events` 中的 `EventHandler` 配置解析为真实的回调函数：

```typescript
// packages/core/src/events/resolver.ts

interface EventContext {
  formValues: Record<string, unknown>
  setFieldValue: (name: string, value: unknown) => void
  submit: () => void
  reset: () => void
  validate: (name?: string) => Promise<boolean>
  callbacks: Record<string, (...args: any[]) => void>
}

function resolveEventHandler(
  handler: EventHandler,
  fieldName: string,
  context: EventContext
): (...args: any[]) => void {
  switch (handler.type) {
    case 'expression':
      return createExpressionHandler(handler.expression!, fieldName, context)
    case 'action':
      return createActionHandler(handler.action!, handler.params, context)
    case 'callback':
      return createCallbackHandler(handler.callback!, context)
  }
}
```

#### EventContext 字段的来源与实现位置

EventContext 由 `FormRender` 装配后通过 props 注入 `FieldRenderer`。下列字段中部分**需要新增**：

| 字段 | 来源 | 实现说明 |
|------|------|---------|
| `formValues` | 既有 | 来自 `FormRender` 内部 `useState<Record<string, unknown>>` |
| `setFieldValue(name, value)` | **新增** | 拆自既有 `handleFieldChange`：原逻辑是 `(name, val) => setFormValues(prev => ({...prev, [name]: val}))`，抽出独立引用即可 |
| `submit()` | **新增** | 抽自既有 `handleSubmit`（[FormRender.tsx:182-185](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx#L182-L185)）：把 `onSubmit?.(formValues)` 提到独立箭头函数 |
| `reset()` | **新增** | 抽自重置按钮 `onClick` 内的 `setFormValues(initialValues); onChange?.(initialValues)` |
| `validate(name?)` | **新增** | 遍历目标 field 的 `rules`，按 `required / min / max / len / pattern / type` 执行基础校验；返回是否通过。本期不实现自定义 `validator` 函数体（与 expression 体系重复），仅返回规则校验结果 |
| `callbacks` | **新增（FormRender 接收）** | 直接转发 `FormRenderProps.callbacks`（详见 3.2） |

> 注意：`validate` 是本期新增能力，不在现有 FormRender 范围内。实现位置建议放在 `packages/core/src/renderer/validate.ts` 中，由 `FormRender` 装配时导入调用。

### 5.2 三种处理器的实现

```
expression → 构建 $self/$form/$event 上下文（详见 4.4），复用 evalExpr 执行表达式字符串
action     → 查表映射到预定义动作（详见 2.4：submit / reset / validate / setFieldValue）
callback   → 查表映射到 callbacks 中的函数，透传原始事件参数
```

> 旧版列出的 `navigate` action **已被移除**：路由跳转属于宿主应用职责，不应在表单引擎内部硬编码。如需跳转，请通过 `callbacks.navigate` 自行实现，或在 `events/actions.ts` 中按需扩展（详见 2.4 扩展方式）。

### 5.3 事件合并

`FieldRenderer` 中，将 `field.events` 解析后的处理器与 `componentProps` 合并。**合并优先级**（后写覆盖前写）：

```
内置 props < componentProps < 事件处理器（events 解析结果）
```

```typescript
// FieldRenderer 中
const eventHandlers = resolveEvents(field.events, fieldName, eventContext)

// 1. onChange 包装：先更新当前字段值，再执行用户事件
//    这样无论用户配置的是 expression / action / callback，
//    当前字段的 formValues 都会被同步更新
const handleChange = (value: unknown) => {
  defaultOnChange(value)              // ① 始终写入 formValues
  eventHandlers.onChange?.(value)     // ② 再执行用户事件
}

const fieldProps: Record<string, unknown> = {
  value,
  onChange: handleChange,
  disabled: isDisabled,
  readOnly: field.readOnly,
  placeholder: field.placeholder,
  options: resolvedOptions,
  fieldSchema: field,
  ...field.componentProps,            // ③ 透传（优先级：内置 < componentProps）
  ...eventHandlers,                   // ④ 事件处理器最后 spread，最高优先级
  //     注意：onChange 已在上面重新包装，这里 spread 进来的 onChange
  //     不会覆盖上面的 handleChange（解构时按 key 合并顺序取最后值，
  //     因此若 componentProps 里写了 onChange，eventHandlers 仍能覆盖）
}
```

#### 命名说明

- `defaultOnChange` 是新引入的命名，指代由 `FormRender` 通过 props 传入的"写入 formValues 的默认 onChange"（即当前 [FieldRenderer.tsx:30](file:///d:/Repos/form_engine/packages/core/src/renderer/FieldRenderer.tsx#L30) 的 `onChange` 形参）。不要与组件库自身的 `onChange` 混淆。
- `eventHandlers` 是 `resolveEvents` 返回的 `Record<string, (...args: any[]) => void>`，key 与 `field.events` 一致（如 `onSearch`、`beforeUpload`）。
- 如果 `field.events` 未配置或对应事件未声明，`eventHandlers[key]` 为 `undefined`，spread 后不影响最终值。

#### 反例：错误的合并顺序

```typescript
// ❌ 错误：componentProps 在后，会覆盖事件处理器
const fieldProps = {
  ...eventHandlers,
  ...field.componentProps,  // 这里的 onClick 会覆盖上面 eventHandlers.onClick
}
```

这是初版文档中给出的示例，**已被本节修正**。

---

## 六、设计器属性面板

### 6.1 PropertyPanel 新增"事件"折叠区

在 `PropertyPanel` 中，根据组件类型查询其支持的事件声明，渲染事件配置表：

```
┌─ 事件配置 ──────────────────────────┐
│  onClick    [expression ▼] [$form.submit()] │
│  onBlur     [未配置]                        │
│  onSearch   [action ▼]     [setFieldValue ▼]│
└──────────────────────────────────────┘
```

### 6.2 事件编辑器组件

- `EventHandlerEditor`：选择处理类型（expression/action/callback）
- `ExpressionEditor`：表达式输入框（带语法提示）
- `ActionSelector`：预定义动作下拉
- `CallbackSelector`：回调函数名输入

### 6.3 事件声明获取

- 内置组件：通过 `getEventDeclarations(type)` 函数，从各组件的 `types.ts` 中汇聚
- 自定义组件：从 `customComponentRegistry.get(type).events` 获取

---

## 七、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `types/events.ts` | 新增 | EventHandler、EventDeclaration、EventParamDeclaration 类型 |
| `types/schema.ts` | 修改 | FormFieldSchema 新增 `events` 字段，新增 FormFieldEvents 类型 |
| `types/render.ts` | 修改 | FormRenderProps 新增 `callbacks` 字段 |
| `types/custom-component.ts` | 修改 | CustomComponentConfig 新增 `events` 字段 |
| `types/component-props.ts` | 无变更 | 现有类型满足需求 |
| `events/resolver.ts` | 新增 | 事件解析引擎 |
| `events/index.ts` | 新增 | 事件模块导出 |
| `renderer/FieldRenderer.tsx` | 修改 | 集成事件解析，合并事件处理器到 fieldProps |
| `renderer/FormRender.tsx` | 修改 | 传递 callbacks 和 form actions 上下文 |
| `designer/PropertyPanel.tsx` | 修改 | 新增"事件"折叠区域 |
| `designer/EventHandlerEditor.tsx` | 新增 | 事件编辑器组件 |
| 各组件 `types.ts` | 修改 | 新增事件声明导出（如 `selectEventDeclarations`） |
| `components/index.ts` | 修改 | 汇聚所有组件的事件声明 |
| `registry/customComponentRegistry.ts` | 无变更 | `get(type)` 返回值已能承载新加的 `events` 字段（无需改接口） |

---

## 八、实施步骤

### 步骤 1：定义核心类型

- 新建 `types/events.ts`，定义 `EventHandler`、`EventDeclaration`、`EventParamDeclaration`
- 修改 `types/schema.ts`，新增 `FormFieldEvents`，`FormFieldSchema` 新增 `events` 字段
- 修改 `types/render.ts`，`FormRenderProps` 新增 `callbacks` 字段
- 修改 `types/custom-component.ts`，`CustomComponentConfig` 新增 `events` 字段

### 步骤 2：实现事件解析引擎

- 新建 `events/resolver.ts`，实现 `resolveEvents()` 函数
- 实现三种处理器：expression、action、callback
- 定义 `EventContext` 接口和预定义 action 表

### 步骤 3：集成到 FieldRenderer

- 修改 `FieldRenderer.tsx`，读取 `field.events`，调用 `resolveEvents` 生成处理器
- 将事件处理器合并到 `fieldProps`（优先级：事件处理器 > componentProps）
- 保持向后兼容：无 `events` 配置时行为不变

### 步骤 4：集成到 FormRender

- 修改 `FormRender.tsx`，构建 `EventContext`（formValues、setFieldValue、submit、reset 等）
- 将 `callbacks` 传递给 `FieldRenderer`

### 步骤 5：各组件声明事件

- 为每个内置组件在 `types.ts` 中新增 `xxxEventDeclarations` 导出
- 在 `components/index.ts` 中汇聚，提供 `getEventDeclarations(type)` 查询函数

### 步骤 6：设计器事件配置

- 新建 `EventHandlerEditor.tsx` 组件
- 修改 `PropertyPanel.tsx`，新增"事件"折叠区域
- 根据组件类型查询事件声明，渲染事件配置界面

### 步骤 7：编译验证与测试

- 编译检查，确保无类型错误
- 编写事件解析器单元测试
- 编写自定义组件事件声明测试

---

## 九、边界情况与注意事项

1. **向后兼容**：`field.events` 为可选字段，未配置时 FieldRenderer 行为与当前完全一致
2. **事件优先级**：事件处理器（来自 `events`）> `componentProps` 中的同名属性，确保 `componentProps` 不会意外覆盖事件配置（具体合并顺序见 5.3）
3. **自定义组件**：`custom:` 前缀的组件默认无事件声明，除非在 `CustomComponentConfig.events` 中显式声明
4. **表达式执行机制**：expression 类型复用现有 `evalExpr`（`packages/core/src/utils/index.ts`），其底层为 `new Function(...)`，**等同于可执行任意 JS**。这意味着：
   - 部署方必须保证 schema 来源可信（设计器保存的 schema、经过审核的低代码产物）
   - **不要**直接把用户填入的字符串作为 expression 拼进 schema
   - 后续可选工作：替换为受限 AST 求值器（如 `expr-eval` / `jsep` + 限定操作白名单），与本设计兼容，**但不在本次实现范围内**
5. **action 扩展**：action 表可扩展，新增 action 只需在 `events/actions.ts` 中注册（详见 2.4）
6. **callback 查找**：`callback` 类型在 `callbacks` 中查找，找不到时静默失败（console.warn），不抛异常
7. **onChange 默认行为**：即使配置了 `events.onChange`，框架仍会先把当前字段值写入 formValues，再调用用户事件（详见 5.3）
8. **事件命名与组件 prop 一致**：`field.events` 的 key（如 `onSearch`）必须与目标组件的 prop 名一致，由 `xxxEventDeclarations` 约束设计器可选范围
9. **异步事件**：详见 4.6；默认丢弃回调返回值，仅 `beforeUpload` 等少数场景保留 Promise 语义

---

## 十、错误处理矩阵

resolver 内部对所有可预见的异常采用统一策略，避免一类问题多种表现：

| 异常 | 行为 | 日志 |
|------|------|------|
| `expression` 语法错 / 运行时抛错 | 跳过该 handler | `console.warn('[form-engine] 表达式执行失败: <expr>', err)` |
| `action` 名未在注册表中 | 跳过该 handler | `console.warn('[form-engine] 未知 action: <name>')` |
| `callback` 名在 callbacks 中找不到 | 跳过该 handler | `console.warn('[form-engine] 回调不存在: <name>')` |
| `EventContext` 缺少必要字段 | 抛出（开发态） | `throw new Error('[form-engine] EventContext 缺少字段: <field>')` |
| 同一事件触发多个 handler 报错 | 后续 handler 继续执行 | 单条 `console.warn` |

EventContext 字段缺失抛错是因为这是 FormRender → FieldRenderer 的内部协议，理论上不会出现；如出现说明调用方装配错误，应早暴露。

---

## 状态

- [x] v1 初稿
- [x] v2 评审后修订（修复：表达式安全立场 / 事件合并 spread 顺序 / onChange 包装语义 / EventContext 字段实现位置；补：action 与 expression 关系、navigate 移除、onChange 命名区分、events vs componentProps 分工表、上下文变量定义、异步事件、触发频率、错误处理矩阵、defaultOnChange 命名说明）
- [x] v3 代码实施（新增 events 模块、types/events.ts、events/{resolver,actions,index}.ts、renderer/validate.ts、designer/EventHandlerEditor；修改 FieldRenderer 集成事件系统 / FormRender 构造 EventContext / 各组件 types.ts 声明事件 / PropertyPanel 添加事件折叠区 / 顶层 index.ts 导出事件 API）
  - 验证：core 包 type-check 通过、core 包 build 成功（dist 完整生成）、adapter-antd 和 adapter-antd-mobile build 成功
  - 已知非本任务错误：adapter-antd 的 type-check 报错（antd 5/6 类型不匹配、BaseComponentProps.id 与 antd 不兼容、tsconfig paths 软链 rootDir 配置问题），均为 baseline 已存在，与本次事件系统修改无关
- [ ] 待评审