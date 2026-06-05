# Form/FormItem Adapter 设计方案

## 摘要

为 `FormEngineAdapter` 新增 `FormWrapper`、`FormItem` 和 `validate` 三个可选能力，让适配器可以接管表单容器渲染、字段包裹渲染和校验逻辑，引擎内置校验作为兜底策略。设计器和渲染器统一使用 adapter 的 Form/FormItem。同时为 FormFieldSchema 新增 `help` 字段，为 FormRenderProps 新增 `beforeSubmit`/`afterSubmit` 生命周期钩子。

---

## 现状分析

### 当前架构

| 层级 | 当前实现 | 问题 |
|------|---------|------|
| **表单容器** | `FormRender` 使用原生 `<form>` 元素 | 无法利用 antd `<Form>` 的布局、主题、尺寸等能力 |
| **字段包裹** | `FieldRenderer` 手动渲染 label、必填星号、错误提示 | 无法利用 antd `<Form.Item>` 的 label/colon/validateStatus/tooltip/layout 能力，样式与原生 antd 表单不一致 |
| **校验逻辑** | 引擎内置 `validateForm()` | 功能有限（不支持自定义 validator、异步校验），无法利用 antd 的 async-validator |
| **校验展示** | 每个字段组件需自行处理 validateStatus/help | FieldComponentProps 包含 validateStatus/help，但各 adapter 组件未使用，错误提示由 FieldRenderer 手动渲染 div |
| **静态帮助文本** | 不支持 | FormFieldSchema 无 `help` 字段，无法为字段添加说明文字 |
| **提交生命周期** | 仅 `onSubmit` 回调 | 无法在提交前拦截/转换数据，无法在提交后执行副作用 |
| **设计器画布** | `SortableField` 直接使用 `FieldRenderer`，无 Form 包裹 | 设计态预览与运行态渲染不一致 |

### 关键文件

| 文件 | 职责 |
|------|------|
| `packages/core/src/types/adapter.ts` | Adapter 接口定义 |
| `packages/core/src/types/schema.ts` | Schema 类型定义（FormFieldSchema、FormConfig） |
| `packages/core/src/renderer/FormRender.tsx` | 表单渲染（使用 `<form>`） |
| `packages/core/src/renderer/FieldRenderer.tsx` | 字段渲染（手动 label + error） |
| `packages/core/src/renderer/validate.ts` | 内置校验实现 |
| `packages/core/src/renderer/hooks/useFormRender.ts` | 渲染总控 Hook |
| `packages/core/src/renderer/hooks/useFormValidation.ts` | 校验 Hook |
| `packages/core/src/renderer/hooks/useFieldExpression.ts` | 字段表达式计算 |
| `packages/core/src/designer/RootFields/SortableField.tsx` | 设计器字段渲染 |
| `packages/adapter-antd/src/index.tsx` | Antd 适配器 |

---

## 设计方案

### 1. 新增/扩展类型定义

**文件**: `packages/core/src/types/adapter.ts`

#### 1.1 FormWrapperProps

```typescript
/** Form 容器组件 Props */
export interface FormWrapperProps {
  /** 表单配置 */
  formConfig: FormConfig
  /** 适配场景 */
  scene: DeviceScene
  /** 表单提交事件（不传 React.FormEvent，避免 fake event 隐患） */
  onSubmit?: () => void
  /** 子元素 */
  children: React.ReactNode
  /** CSS 类名 */
  className?: string
  /** 内联样式 */
  style?: React.CSSProperties
}
```

#### 1.2 FormItemProps（对齐 antd Form.Item API）

FormItemProps 的设计对齐 antd `<Form.Item>` 的核心 props，使 adapter 映射时一一对应：

```typescript
/** FormItem 包裹组件 Props — 对齐 antd Form.Item 核心属性 */
export interface FormItemProps {
  /** 字段名称（对应 Form.Item name，受控模式下不用于绑定，仅做标识） */
  name?: string
  /** 标签文本 */
  label?: string
  /** 校验规则（仅用于 FormItem 展示用途，如 antd 的校验样式标记；实际校验由引擎 validate 机制执行） */
  rules?: FormRule[]
  /** 是否必填（显示必填标记） */
  required?: boolean
  /** 校验状态（对应 Form.Item validateStatus） */
  validateStatus?: 'error' | 'warning' | 'success' | undefined
  /** 校验错误信息（对应 Form.Item help，仅校验失败时传入） */
  errors?: string[]
  /** 静态帮助文本（对应 Form.Item extra，始终显示在字段下方） */
  help?: string
  /** 提示信息（对应 Form.Item tooltip） */
  tooltip?: string
  /** 表单配置（含 layout/colon/labelCol/wrapperCol 等） */
  formConfig: FormConfig
  /** 适配场景 */
  scene: DeviceScene
  /** 子元素 */
  children: React.ReactNode
}
```

**关键设计决策 — help 与 errors 分离**：

| 场景 | FormItemProps 字段 | antd Form.Item 映射 | 说明 |
|------|-------------------|-------------------|------|
| 静态帮助文本 | `help` | `extra` | 始终显示在字段下方，不被校验错误覆盖 |
| 校验错误信息 | `errors` | `help`（当 validateStatus='error'） | 仅校验失败时显示，覆盖静态帮助 |
| 提示信息 | `tooltip` | `tooltip` | label 旁的问号图标提示 |

这样分离的好处：
- 静态 help 和校验 errors 互不干扰
- antd adapter 映射清晰：`help` → `extra`，`errors[0]` → `help`
- DefaultFormItem 可以同时显示 help 和 errors

**术语注意**：`FieldComponentProps.help`（校验错误提示，映射自 errors[0]）与 `FormItemProps.help`（静态帮助文本，映射到 antd extra）含义不同。FieldRenderer 改造后校验展示统一由 FormItem 处理，FieldComponentProps.help 保留但不再用于校验展示。

#### 1.3 ValidateFn

```typescript
/** 校验函数类型 */
export type ValidateFn = (
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>,
  name?: string,
) => Promise<ValidateResult>
```

#### 1.4 扩展 FormEngineAdapter 接口

```typescript
export interface FormEngineAdapter {
  // ... 现有字段不变 ...

  /** Form 容器组件（可选），不提供时引擎使用原生 <form> */
  FormWrapper?: React.ComponentType<FormWrapperProps>

  /** FormItem 包裹组件（可选），不提供时引擎使用内置 DefaultFormItem */
  FormItem?: React.ComponentType<FormItemProps>

  /** 校验函数（可选），不提供时引擎使用内置 validateForm() 兜底 */
  validate?: ValidateFn
}
```

### 2. 扩展 FormFieldSchema — 新增 help 字段

**文件**: `packages/core/src/types/schema.ts`

```typescript
export interface FormFieldSchema {
  // ... 现有字段不变 ...
  tooltip?: string       // 已有
  help?: string          // 新增：静态帮助文本，始终显示在字段下方
  // ... 其他字段不变 ...
}
```

### 3. 扩展 FormRenderProps — 新增 beforeSubmit/afterSubmit

**文件**: `packages/core/src/renderer/FormRender.tsx`

```typescript
export interface FormRenderProps {
  // ... 现有字段不变 ...

  /**
   * 提交前钩子
   * - 返回修改后的 values 可转换提交数据
   * - 返回 false 可阻止提交
   * - 返回 void 或 undefined 继续提交
   */
  beforeSubmit?: (values: Record<string, unknown>) => Record<string, unknown> | false | void

  /**
   * 提交后钩子
   * - success=true 表示提交成功
   * - success=false 表示校验失败
   */
  afterSubmit?: (values: Record<string, unknown>, success: boolean) => void
}
```

提交流程变更（在 `useFormRender` 的 `handleSubmit` 中）：

```
1. beforeSubmit(values) → 可修改/阻止
2. 校验（adapter.validate ?? validateForm）
3. 校验失败 → setFieldErrors + afterSubmit(values, false)
4. 校验成功 → onSubmit(values) + afterSubmit(values, true)
```

### 4. 修改 FormRender — 使用 adapter.FormWrapper

**文件**: `packages/core/src/renderer/FormRender.tsx`

**改动**：将 `FormRenderInner` 中的 `<form>` 替换为 adapter 的 `FormWrapper`（如果提供）。

```tsx
const DefaultFormWrapper: React.FC<FormWrapperProps> = ({ onSubmit, children, className, style }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit?.() }} className={className} style={style}>
    {children}
  </form>
)

// FormRenderInner 内部
const FormTag = resolvedAdapter.FormWrapper ?? DefaultFormWrapper
<FormTag formConfig={formConfig} scene={resolvedAdapter.scene} onSubmit={handleFormSubmit} className="fe-form">
  <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}>
    {visibleFields.map((field) => (
      <div key={field.id} style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}>
        <NestedFieldRenderer field={field} onFieldChange={handleFieldChange} />
      </div>
    ))}
  </div>
</FormTag>
```

**注意**：`FormWrapperProps.onSubmit` 类型为 `() => void`（非 React.FormEvent），避免 fake event 隐患。`DefaultFormWrapper` 内部自行处理 `e.preventDefault()`。

### 5. 修改 FieldRenderer — 使用 adapter.FormItem

**文件**: `packages/core/src/renderer/FieldRenderer.tsx`

**核心改动**：将手动 label + error 渲染逻辑提取为 `DefaultFormItem`，当 adapter 提供 `FormItem` 时优先使用。

#### 5.1 DefaultFormItem 实现

从当前 FieldRenderer 提取 label 渲染、必填星号、错误提示、布局逻辑为独立组件：

```tsx
/** 内置默认 FormItem — 从 FieldRenderer 现有逻辑提取 */
const DefaultFormItem: React.FC<FormItemProps> = ({
  label, required, validateStatus, errors, help, tooltip, formConfig, scene, children,
}) => {
  const { token } = useStyle()
  const { labelCol, wrapperCol } = formConfig.scenes[scene]
  const isHorizontal = !(labelCol.span === 24 && wrapperCol.span === 24)
  const colon = formConfig.colon
  const labelText = label ? label + (colon ? '：' : '') : null
  const errorMsg = errors && errors.length > 0 ? errors[0] : undefined

  // label 渲染（同现有逻辑）
  const labelNode = !label ? null : (
    <label style={labelStyle}>
      {required && <span style={{ color: token('error') }}>*</span>}
      {labelText}
      {tooltip && <span title={tooltip} style={{ marginLeft: 4, cursor: 'help' }}>?</span>}
    </label>
  )

  // 字段内容
  const content = (
    <>
      {children}
      {errorMsg && <div style={{ color: token('error'), fontSize: token('fontSizeXs'), marginTop: token('spacingXs') }}>{errorMsg}</div>}
      {help && !errorMsg && <div style={{ color: token('textTertiary'), fontSize: token('fontSizeXs'), marginTop: token('spacingXs') }}>{help}</div>}
    </>
  )

  // 布局（同现有逻辑）
  if (!label || !isHorizontal) {
    return <div>{labelNode}{content}</div>
  }
  return (
    <div style={{ display: 'flex', gap: token('spacingSm') }}>
      <div style={{ width: `${(labelCol.span / 24) * 100}%`, flexShrink: 0, textAlign: formConfig.labelAlign }}>{labelNode}</div>
      <div style={{ width: `${(wrapperCol.span / 24) * 100}%` }}>{content}</div>
    </div>
  )
}
```

#### 5.2 FieldRenderer 改造

```tsx
// FieldRenderer 内部
const FormItemTag = adapter.FormItem ?? DefaultFormItem

// 构建 FormItem props（从 field 和计算结果提取）
const formItemProps: FormItemProps = {
  name: field.name,
  label: isFormComponent(field.type) ? field.label : undefined,
  rules: field.rules,
  required: isRequired,
  validateStatus: errorMsg ? 'error' : undefined,
  errors: errors,  // 来自 FieldRenderer 的 errors prop
  help: field.help,  // 新增的静态帮助文本
  tooltip: field.tooltip,
  formConfig,
  scene: adapter.scene,
}

// 渲染
return (
  <div className="fe-field" style={...}>
    <FormItemTag {...formItemProps}>
      <FieldSchemaContext.Provider value={field}>
        <AdapterContext.Provider value={adapter}>
          <React.Suspense fallback={null}>
            {React.createElement(renderFn, fieldProps)}
          </React.Suspense>
        </AdapterContext.Provider>
      </FieldSchemaContext.Provider>
    </FormItemTag>
  </div>
)
```

**注意**：当使用 adapter.FormItem 时，FieldRenderer 不再手动渲染 label 和 error，全部委托给 FormItem。FieldComponentProps 中的 `validateStatus` 和 `help` 仍然保留（向后兼容），但 FormItem 已统一处理校验展示，各字段组件无需自行处理。

### 6. 修改校验流程 — adapter.validate 兜底

#### 6.1 useFormRender 新增 adapterValidate 参数

**文件**: `packages/core/src/renderer/hooks/useFormRender.ts`

`UseFormRenderOptions` 新增 `adapterValidate` 字段，由 `FormRenderInner` 传入 `resolvedAdapter?.validate`：

```typescript
export interface UseFormRenderOptions {
  schema: FormSchema
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  callbacks?: EventCallbacks
  /** adapter 的校验函数，由 FormRenderInner 传入 resolvedAdapter?.validate */
  adapterValidate?: ValidateFn
}
```

FormRenderInner 调用处：

```typescript
const { ... } = useFormRender({
  schema, initialValues, onSubmit, onChange, dataSourceResolver, callbacks,
  adapterValidate: resolvedAdapter?.validate,
})
```

#### 6.2 handleSubmit 改造

```typescript
const handleSubmit = useCallback(() => {
  // 1. beforeSubmit 钩子（用局部变量，不直接修改 formValuesRef）
  let submitValues_ = formValuesRef.current
  if (beforeSubmit) {
    const result = beforeSubmit(submitValues_)
    if (result === false) return  // 阻止提交
    if (result && typeof result === 'object') submitValues_ = result  // 转换数据
  }

  // 2. 校验（adapter.validate 优先，内置兜底）
  const doValidate = adapterValidate ?? validateForm
  Promise.resolve(doValidate(visibleFields, submitValues_))
    .then((result) => {
      if (!result.valid) {
        setFieldErrors(result.errors)
        afterSubmit?.(submitValues_, false)
        return
      }
      // 3. 校验成功，提交
      setFieldErrors({})
      if (onSubmit) onSubmit(submitValues_)
      afterSubmit?.(submitValues_, true)
    })
    .catch((err) => {
      console.error('[form-engine] 校验异常:', err)
    })
}, [visibleFields, formValuesRef, setFieldErrors, onSubmit, adapterValidate, beforeSubmit, afterSubmit])
```

#### 6.3 validate 方法改造

对外暴露的 `validate()` 方法（FormRenderHandle）也优先走 adapter.validate：

```typescript
const validate = useCallback(
  async (name?: string): Promise<boolean> => {
    const doValidate = adapterValidate ?? validateForm
    const result = await Promise.resolve(doValidate(formSchema.fields, formValues, name))
    if (!result.valid) {
      console.warn('[form-engine] 校验失败:', result.errors)
    }
    return result.valid
  },
  [adapterValidate, formSchema.fields, formValues],
)
```

#### 6.4 useFormValidation 改造

**文件**: `packages/core/src/renderer/hooks/useFormValidation.ts`

`validate` 和 `validateRaw` 不再新增参数，而是由 `useFormRender` 直接使用 `adapterValidate` 调用。`useFormValidation` 保持现有签名不变，仅作为内部校验状态管理的 hook。

### 7. 设计器画布

**文件**: `packages/core/src/designer/RootFields/SortableField.tsx`

FormItem 的使用在 FieldRenderer 内部自动生效（通过 adapter prop），无需额外修改。

设计器画布首期不包裹 FormWrapper（设计态无需表单提交），后续可按需增强。

**验证注意**：SortableField 使用 FieldRenderer 后会自动套上 adapter.FormItem，设计态中字段 label 和布局会与运行态一致。实施后需确认 antd Form.Item 在画布中的样式（border、padding、margin 等）是否与拖拽体验兼容，必要时在设计器中通过 CSS 覆盖 Form.Item 的装饰性样式。

### 8. Antd 适配器实现

#### 8.1 FormWrapper

**新增文件**: `packages/adapter-antd/src/components/FormWrapper.tsx`

```tsx
import { Form } from 'antd'
import type { FormWrapperProps } from '@form-engine/core'

export const AntdFormWrapper: React.FC<FormWrapperProps> = ({
  formConfig, scene, onSubmit, children, className, style,
}) => {
  return (
    <Form
      layout={formConfig.layout}
      colon={formConfig.colon}
      size={formConfig.size}
      labelAlign={formConfig.labelAlign}
      labelCol={formConfig.scenes[scene]?.labelCol}
      wrapperCol={formConfig.scenes[scene]?.wrapperCol}
      onFinish={() => onSubmit?.()}
      className={className}
      style={style}
    >
      {children}
    </Form>
  )
}
```

**注意**：不使用 antd Form 实例管理值，仅用于布局和上下文。值管理仍由引擎 `useFormValues` 负责。`onFinish` 直接调用 `onSubmit?.()`，无需 fake event。

#### 8.2 FormItem

**新增文件**: `packages/adapter-antd/src/components/FormItem.tsx`

```tsx
import { Form } from 'antd'
import type { FormItemProps } from '@form-engine/core'

export const AntdFormItem: React.FC<FormItemProps> = ({
  label, required, validateStatus, errors, help, tooltip, formConfig, scene, children,
}) => {
  // help 与 errors 分离映射：
  // - errors[0] → antd Form.Item help（校验错误信息）
  // - help → antd Form.Item extra（静态帮助文本）
  const errorMsg = errors && errors.length > 0 ? errors[0] : undefined

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={errorMsg}
      extra={help}
      tooltip={tooltip || undefined}
      labelCol={formConfig.scenes[scene]?.labelCol}
      wrapperCol={formConfig.scenes[scene]?.wrapperCol}
    >
      {children}
    </Form.Item>
  )
}
```

**关键映射**：

| FormItemProps | antd Form.Item | 说明 |
|--------------|----------------|------|
| `errors[0]` | `help` | 校验错误信息 |
| `help` | `extra` | 静态帮助文本 |
| `validateStatus` | `validateStatus` | 校验状态 |
| `tooltip` | `tooltip` | label 旁提示 |
| `label` | `label` | 标签文本 |
| `required` | `required` | 必填标记 |

**注意**：不使用 `name` 属性（受控模式），避免 antd Form.Item 自动绑定表单实例。校验状态通过 props 显式传入。antd Form.Item 的 `validateStatus` 会使子组件自动获得校验边框样式（红色/绿色），无需各组件自行处理。

#### 8.3 注册到 adapter

```typescript
export const antdAdapter: FormEngineAdapter = {
  // ... 现有字段 ...
  FormWrapper: AntdFormWrapper,
  FormItem: AntdFormItem,
}
```

### 9. Antd Mobile 适配器实现

**新增文件**: `packages/adapter-antd-mobile/src/components/FormWrapper.tsx`
**新增文件**: `packages/adapter-antd-mobile/src/components/FormItem.tsx`

类似 antd 适配器，使用 antd-mobile 的 `<Form>` 和 `<Form.Item>` 实现。antd-mobile 的 Form.Item API 与 antd 类似，映射关系一致。

---

## 改动文件清单

| 文件 | 改动类型 | 说明 |
|------|---------|------|
| `packages/core/src/types/adapter.ts` | 修改 | 新增 FormWrapperProps、FormItemProps、ValidateFn；扩展 FormEngineAdapter |
| `packages/core/src/types/schema.ts` | 修改 | FormFieldSchema 新增 `help` 字段 |
| `packages/core/src/renderer/FormRender.tsx` | 修改 | 使用 adapter.FormWrapper；新增 DefaultFormWrapper；新增 beforeSubmit/afterSubmit props |
| `packages/core/src/renderer/FieldRenderer.tsx` | 修改 | 使用 adapter.FormItem；新增 DefaultFormItem；移除内联 label/error 渲染 |
| `packages/core/src/renderer/hooks/useFormRender.ts` | 修改 | handleSubmit 支持 adapter.validate + beforeSubmit/afterSubmit |
| `packages/core/src/renderer/hooks/useFormValidation.ts` | 修改 | validate/validateRaw 支持 adapter.validate 传入 |
| `packages/core/src/index.ts` | 修改 | 导出新增类型：FormWrapperProps、FormItemProps、ValidateFn、ValidateResult |
| `packages/adapter-antd/src/components/FormWrapper.tsx` | 新增 | Antd FormWrapper 实现 |
| `packages/adapter-antd/src/components/FormItem.tsx` | 新增 | Antd FormItem 实现 |
| `packages/adapter-antd/src/index.tsx` | 修改 | 注册 FormWrapper/FormItem |
| `packages/adapter-antd-mobile/src/components/FormWrapper.tsx` | 新增 | Antd Mobile FormWrapper 实现 |
| `packages/adapter-antd-mobile/src/components/FormItem.tsx` | 新增 | Antd Mobile FormItem 实现 |
| `packages/adapter-antd-mobile/src/index.tsx` | 修改 | 注册 FormWrapper/FormItem |

---

## 实施步骤

1. **类型定义**：`adapter.ts` 新增 FormWrapperProps、FormItemProps、ValidateFn，扩展 FormEngineAdapter
2. **Schema 扩展**：`schema.ts` FormFieldSchema 新增 `help` 字段
3. **DefaultFormWrapper**：`FormRender.tsx` 实现默认 Form 容器（即当前 `<form>` 逻辑）
4. **DefaultFormItem**：`FieldRenderer.tsx` 从现有逻辑提取为独立组件
5. **FormRender 改造**：使用 `adapter.FormWrapper ?? DefaultFormWrapper`；新增 beforeSubmit/afterSubmit
6. **FieldRenderer 改造**：使用 `adapter.FormItem ?? DefaultFormItem`
7. **校验流程改造**：useFormRender/useFormValidation 支持 adapter.validate
8. **Antd 适配器**：实现 AntdFormWrapper、AntdFormItem，注册到 adapter
9. **Antd Mobile 适配器**：实现对应组件，注册到 adapter
10. **导出更新**：core/index.ts 导出新增类型
11. **编译验证**：`pnpm build` 确保所有包编译通过

---

## 假设与决策

| 决策 | 理由 |
|------|------|
| FormWrapper/FormItem/validate 均为可选 | 向后兼容，不提供时完全等同现有行为 |
| 受控模式：FormItem 不使用 name 属性 | 避免与引擎 useFormValues 值管理冲突，校验状态通过 props 显式传入 |
| help 与 errors 分离 | 静态帮助文本（help→extra）和校验错误（errors→help）互不干扰 |
| validate 统一为 Promise 返回 | adapter.validate 可能是异步的，统一为 Promise 简化调用方 |
| hidden 保持过滤移除 | 不改 useVisibility 逻辑，hidden 字段不渲染 DOM |
| beforeSubmit/afterSubmit 在 FormRenderProps 层面 | 作为使用者 API，不侵入 adapter 和 schema |
| 设计器画布首期不包裹 FormWrapper | 设计态无需表单提交，FormItem 通过 FieldRenderer 自动生效 |
| DefaultFormItem 从 FieldRenderer 提取 | 保持现有渲染逻辑不变，只是从内联代码提取为独立组件 |
| antd FormItem 通过 validateStatus 自动为子组件添加校验样式 | 无需各字段组件自行处理 validateStatus |

---

## 验证步骤

1. 不传 adapter.FormWrapper/FormItem 时，渲染结果与改动前完全一致
2. 传入 antd adapter 的 FormWrapper/FormItem 后，表单使用 antd 的 Form/Form.Item 渲染
3. 校验流程：不传 adapter.validate 时使用内置校验；传入时使用 adapter 校验
4. help 字段：在 FormFieldSchema 中设置 help 后，静态帮助文本始终显示在字段下方
5. 校验错误与静态 help 互不干扰：有错误时显示错误，无错误时显示 help
6. beforeSubmit 返回 false 可阻止提交，返回对象可转换数据
7. afterSubmit 在提交后（无论成功失败）被调用
8. 设计器画布：使用 antd adapter 时，字段布局与运行态一致
9. 编译通过：`pnpm build` 无错误
10. Token 检查：`pnpm check:tokens` 无违规

---

## 补充说明（Review 反馈处理）

### 1. adapter 集成链路完整性

`UseFormRenderOptions` 已新增 `adapterValidate?: ValidateFn` 字段，由 `FormRenderInner` 传入 `resolvedAdapter?.validate`。`useFormRender.validate()` 和 `handleSubmit` 内部均使用 `adapterValidate ?? validateForm` 优先走 adapter 校验。

### 2. FormWrapperProps.onSubmit 类型

`onSubmit` 类型为 `() => void`（非 `React.FormEvent`），避免 fake event 隐患。`DefaultFormWrapper` 内部自行处理 `e.preventDefault()`，antd adapter 的 `onFinish` 直接调 `onSubmit?.()`。

### 3. FormItemProps.rules 语义

`FormItemProps.rules` 仅用于 FormItem 展示用途（如 antd 的校验样式标记），不用于实际校验逻辑。实际校验由引擎 `validate` 机制执行。

### 4. help 术语过载

- `FieldComponentProps.help`：校验错误提示（映射自 `errors[0]`）
- `FormItemProps.help`：静态帮助文本（映射到 antd `extra`）

FieldRenderer 改造后校验展示统一由 FormItem 处理，`FieldComponentProps.help` 保留但不再用于校验展示。

### 5. NestedFieldRenderer 传递 field.help

`NestedFieldRenderer` 传给 `FieldRenderer` 的 `field` 对象包含 `help` 字段，`FieldRenderer` 内部通过 `field.help` 获取，无需额外处理。

### 6. 新增类型导出

`packages/core/src/index.ts` 导出：`FormWrapperProps`、`FormItemProps`、`ValidateFn`、`ValidateResult`。

### 7. 设计器 FormItem 展示

SortableField 使用 FieldRenderer 后会自动套上 `adapter.FormItem`，设计态中字段 label 和布局与运行态一致。实施后需确认 antd Form.Item 在画布中的样式（border、padding、margin 等）是否与拖拽体验兼容，必要时通过 CSS 覆盖。
