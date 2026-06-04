# useFormRender Hook 提取重构方案

> 对应主文档：[code-optimization-analysis.md](./code-optimization-analysis.md) — 3.13
> 状态：待执行
> 日期：2026-06-04
> 最后更新：2026-06-04

---

## 1. 目标

将 `FormRender.tsx`（目前 361 行，混合状态管理、数据源、校验、渲染多重职责）拆分为职责单一的 hook + 组件，提升可维护性和可测试性。

---

## 2. 现状分析

**文件**：[FormRender.tsx](file:///d:/Repos/form_engine/packages/core/src/renderer/FormRender.tsx)

### 当前职责分布

| 职责 | 涉及代码 | 行数约 |
|------|---------|--------|
| 表单状态管理（values / errors / options / depsSnapshot） | `useState` × 4 | 20 |
| onChange 防抖 | `onChangeTimerRef` + `debouncedOnChange` + cleanup effect | 20 |
| 字段变更处理（`handleFieldChange` / `setFieldValue` / `setFieldsValue` 等） | `useCallback` × 5 | 60 |
| 可见字段过滤 | `useMemo` → `visibleFields` | 20 |
| `$form` 对象构建 | `useMemo` + `formValuesRef` | 30 |
| 事件上下文构建 | `useMemo` → `eventContext` | 15 |
| 数据源加载（含依赖快照校验） | `loadDataSource` + `useEffect` × 2 | 70 |
| 提交处理 | `submit` | 10 |
| 校验逻辑 | `validate` | 15 |
| `forwardRef` / `useImperativeHandle` | `React.forwardRef` + `useImperativeHandle` | 10 |
| `NestedFieldRenderer` 递归渲染 | `NestedFieldRenderer` | 40 |
| UI 逻辑（theme / adapter / pickAdapter） | `useEnsureDefaultTheme` / `useStyle` / `pickAdapter` | 5 |
| 组件返回值 | JSX | 30 |

### 问题

- **可读性差**：新贡献者需要理解全部职责后才能安全修改
- **不可单独测试**：数据源逻辑必须挂载组件才能测试
- **复用困难**：编程式表单操作（`$form`）与组件渲染耦合
- **重构风险高**：361 行全部在一起，修改一处可能影响其他逻辑

### 跨职责联动点（拆分难点）

当前代码中存在多处跨职责的原子操作，拆分后需在聚合层编排：

| 联动操作 | 涉及状态 | 代码位置 |
|---------|---------|---------|
| `handleFieldChange` 设值 + 清除该字段 errors | values + errors | FormRender.tsx:112-127 |
| `reset` 重置 values + 清除全部 errors + 调用 onChange | values + errors + onChange | FormRender.tsx:153-157 |
| `submit` 校验 + 设 errors + 提交 | errors + values + onSubmit | FormRender.tsx:160-168 |
| `loadDataSource` 读取 formValuesRef + 设 fieldOptions + 更新 depsSnapshot | values(ref) + options + depsSnapshot | FormRender.tsx:218-280 |

---

## 3. 设计方案

### 3.1 整体架构

```
FormRender.tsx (presentation)
├── forwardRef + useImperativeHandle（暴露 submit / reset / validate）
├── UI 逻辑（useEnsureDefaultTheme / useStyle / pickAdapter）
├── 调用 useFormRender 获取逻辑状态
├── 组装 JSX（含 handleFormSubmit）
├── 传递 loading / components / formConfig 给 NestedFieldRenderer
└── 转发 props 给 NestedFieldRenderer → FieldRenderer

useFormRender.ts (聚合 hook — 编排跨 hook 联动)
├── useFormValues       — values / setFieldValue / reset / submit / debouncedOnChange
├── useFormValidation   — errors / validate / fieldOptions
├── useDataSource       — loadDataSource / debounce / depsSnapshot
├── useVisibility       — visibleFields / 可见性判断
├── 编排联动：handleFieldChange / reset / handleSubmit
├── 构建 $form 对象
├── 构建 eventContext
└── 暴露 validate（供 useImperativeHandle 消费）

useFormRender.ts → FormRender.tsx
       ↓
   外部使用（编程式 API）
```

### 3.2 Hook 间通信设计

子 hook 只管理自身状态，**不直接操作其他 hook 的状态**。跨 hook 联动统一在 `useFormRender` 聚合层编排：

```
useFormValues        → 暴露 setFormValues, formValuesRef, submit, reset
useFormValidation    → 暴露 setFieldErrors, setFieldOptions, validate
useDataSource        → 暴露 loadDataSource
useVisibility        → 暴露 visibleFields（纯计算，无副作用）

useFormRender 聚合层：
  handleFieldChange → 调用 setFormValues + clearFieldError + debouncedOnChange
  reset             → 调用 resetValues + clearAllErrors
  handleSubmit      → 调用 validateForm + setFieldErrors + submit
```

### 3.3 Hook 拆分方案

#### `useFormValues`

```typescript
interface UseFormValuesOptions {
  initialValues: Record<string, unknown>
  onChange?: (values: Record<string, unknown>) => void
}

function useFormValues({ initialValues, onChange }: UseFormValuesOptions) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(initialValues)
  const formValuesRef = useRef(formValues)
  formValuesRef.current = formValues

  // onChange 防抖（300ms）
  const onChangeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const debouncedOnChange = useCallback(() => {
    if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current)
    onChangeTimerRef.current = setTimeout(() => {
      onChangeRef.current?.(formValuesRef.current)
    }, 300)
  }, [])

  // cleanup
  useEffect(() => {
    return () => { if (onChangeTimerRef.current) clearTimeout(onChangeTimerRef.current) }
  }, [])

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [name]: value }))
    debouncedOnChange()
  }, [debouncedOnChange])

  const setFieldsValue = useCallback((patch: Record<string, unknown>) => {
    setFormValues(prev => {
      const next = { ...prev, ...patch }
      onChangeRef.current?.(next)
      return next
    })
  }, [])

  const getFieldValue = useCallback((name: string): unknown => formValues[name], [formValues])

  const reset = useCallback(() => {
    setFormValues(initialValues)
    onChangeRef.current?.(initialValues)
  }, [initialValues])

  const submit = useCallback((onSubmit?: (values: Record<string, unknown>) => void) => {
    onSubmit?.(formValuesRef.current)
  }, [])

  return {
    formValues, formValuesRef, setFormValues,
    setFieldValue, setFieldsValue, getFieldValue,
    reset, submit, debouncedOnChange,
  }
}
```

> **注意**：`reset` 不再清除 `fieldErrors`，该联动由聚合层 `useFormRender` 编排。
> `submit` 接收 `onSubmit` 参数而非闭包捕获，避免聚合层依赖变更导致 hook 重建。
> `initialValues` 来自 `FormRenderProps.initialValues`（优先）或 `schema.values`。

#### `useFormValidation`

```typescript
function useFormValidation() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [fieldOptions, setFieldOptions] = useState<Record<string, OptionItem[]>>({})

  // 返回 { valid, errors } — 供聚合层编排用，不直接暴露给 $form
  const validateRaw = useCallback(
    async (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string): Promise<ValidateResult> => {
      const result = validateForm(fields, formValues, name)
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result
    },
    [],
  )

  // 返回 boolean — 匹配 $Form.validate 签名
  const validate = useCallback(
    async (fields: FormFieldSchema[], formValues: Record<string, unknown>, name?: string): Promise<boolean> => {
      const result = validateForm(fields, formValues, name)
      if (!result.valid) {
        console.warn('[form-engine] 校验失败:', result.errors)
      }
      return result.valid
    },
    [],
  )

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors(prev => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const clearAllErrors = useCallback(() => setFieldErrors({}), [])

  return {
    fieldErrors, fieldOptions, setFieldErrors, setFieldOptions,
    validate, validateRaw, clearFieldError, clearAllErrors,
  }
}
```

> **注意**：`fieldErrors` 类型为 `Record<string, string[]>`（非 `string`），与 `validateForm` 返回值一致。
> `validate` 返回 `Promise<boolean>` 以匹配 `$Form` 接口。`validateRaw` 返回完整 `ValidateResult` 供聚合层编排用。
> `validate` 接收 `fields` + `formValues` 参数而非闭包捕获，保持 hook 无外部依赖。

#### `useDataSource`

```typescript
interface UseDataSourceOptions {
  formSchema: FormSchema
  formValuesRef: { current: Record<string, unknown> }
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, OptionItem[]>>>
  dataSourceResolver?: DataSourceResolver
}

function useDataSource({ formSchema, formValuesRef, setFieldOptions, dataSourceResolver }: UseDataSourceOptions) {
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  // 依赖快照：记录每个 field 当前请求的依赖值，防止过期响应覆盖
  const [fieldDepsSnapshot, setFieldDepsSnapshot] = useState<Record<string, string>>({})

  const loadDataSource = useCallback(async (field: FormFieldSchema, debounceMs = 300) => {
    if (!field.dataSource) return
    const ds = field.dataSource

    // static：直接写入
    if (ds.type === 'static') {
      setFieldOptions(prev => ({ ...prev, [field.name]: ds.static!.options || [] }))
      return
    }

    // remote：异步加载（带防抖 + 依赖快照校验）
    if (ds.type === 'remote') {
      const currentValues = formValuesRef.current
      if (!checkRequiredDeps(ds, currentValues)) return

      const timers = debounceTimersRef.current
      const existing = timers.get(field.name)
      if (existing) clearTimeout(existing)

      const timer = setTimeout(async () => {
        try {
          const latestValues = formValuesRef.current
          const deps = getDataSourceDeps(ds)
          const snapshot = deps.map(d => `${d}=${(latestValues as Record<string, unknown>)[d]}`).join(',')
          setFieldDepsSnapshot(prev => ({ ...prev, [field.name]: snapshot }))

          const options = await resolveDataSource(ds, {
            fieldName: field.name, formValues: latestValues,
            fieldSchema: field, formSchema: schema,
          }, dataSourceResolver)

          // 校验快照：依赖在请求期间变化则丢弃
          const currentSnapshot = deps.map(d => `${d}=${(formValuesRef.current as Record<string, unknown>)[d]}`).join(',')
          if (snapshot !== currentSnapshot) {
            console.warn(`[form-engine] 数据源 ${field.name} 依赖已变化，丢弃过期响应`)
            return
          }

          setFieldOptions(prev => ({ ...prev, [field.name]: options }))
        } catch (err) {
          console.warn(`[form-engine] 数据源加载失败: ${field.name}`, err)
        }
      }, debounceMs)

      timers.set(field.name, timer)
    }
  }, [formSchema, dataSourceResolver, setFieldOptions])

  // 初始化加载
  useEffect(() => {
    formSchema.fields.forEach(field => {
      if (!field.dataSource) return
      if (field.dataSource.type === 'static') {
        loadDataSource(field, 0)
      } else if (field.dataSource.type === 'remote') {
        if (checkRequiredDeps(field.dataSource, formValuesRef.current)) {
          loadDataSource(field, 0)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 仅初始化

  // 依赖变化时重新加载 remote dataSource
  useEffect(() => {
    formSchema.fields.forEach(field => {
      if (!field.dataSource || field.dataSource.type !== 'remote') return
      const deps = getDataSourceDeps(field.dataSource)
      if (deps.length === 0) return
      if (checkRequiredDeps(field.dataSource, formValuesRef.current)) {
        loadDataSource(field, 300)
      }
    })
  }, [formValuesRef.current, formSchema.fields, loadDataSource])

  return { loadDataSource, debounceTimersRef }
}
```

> **注意**：`fieldDepsSnapshot` 状态归入 `useDataSource`，与数据源加载逻辑内聚。
> 依赖变化 effect 的触发源需从 `formValues` 改为 `formValuesRef.current`，在聚合层通过 `formValues` 传入以保持响应性（见聚合层实现）。
> `debounceTimersRef` 导出供外部测试用（替代原来的模块级 `debounceTimers` Map）。

#### `useVisibility`

```typescript
function useVisibility(
  formSchema: FormSchema,
  formValues: Record<string, unknown>,
) {
  const visibleFields = useMemo(
    () => formSchema.fields.filter(field => {
      if (field.hidden === true) return false
      if (typeof field.hidden === 'string') return !evalExpr(field.hidden, formValues)
      if (field.visibleIfExpr) return !!evalExpr(field.visibleIfExpr, formValues)
      if (field.visibleWhen) return matchVisibleWhen(field.visibleWhen, formValues)
      return true
    }),
    [formSchema.fields, formValues],
  )
  return { visibleFields }
}
```

> **注意**：可见性判断包含 `hidden`（bool/string）、`visibleIfExpr`、`visibleWhen` 三种机制，不可简化为单一 `isFieldVisible` 调用，需保留完整逻辑。

#### 聚合 hook: `useFormRender`

```typescript
interface UseFormRenderOptions {
  schema: FormSchema
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onChange?: (values: Record<string, unknown>) => void
  dataSourceResolver?: DataSourceResolver
  callbacks?: Record<string, (...args: any[]) => void>
}

function useFormRender({ schema, initialValues, onSubmit, onChange, dataSourceResolver, callbacks = {} }: UseFormRenderOptions) {
  const formSchema = useMemo(() => schema, [schema])

  const {
    formValues, formValuesRef, setFormValues,
    setFieldValue, setFieldsValue, getFieldValue,
    reset: resetValues, submit, debouncedOnChange,
  } = useFormValues({ initialValues: initialValues ?? schema.values ?? {}, onChange })

  const {
    fieldErrors, fieldOptions, setFieldErrors, setFieldOptions,
    validate, validateRaw, clearFieldError, clearAllErrors,
  } = useFormValidation()

  const { loadDataSource } = useDataSource({
    formSchema, formValuesRef, setFieldOptions, dataSourceResolver,
  })

  const { visibleFields } = useVisibility(formSchema, formValues)

  // ── 跨 hook 联动 ──

  // 字段变更：设值 + 清除该字段 errors
  const handleFieldChange = useCallback((name: string, value: unknown) => {
    setFormValues(prev => ({ ...prev, [name]: value }))
    clearFieldError(name)
    debouncedOnChange()
  }, [setFormValues, clearFieldError, debouncedOnChange])

  // 编程式设值（委托 handleFieldChange）
  const $setFieldValue = useCallback((name: string, value: unknown) => {
    handleFieldChange(name, value)
  }, [handleFieldChange])

  // 重置：values + errors
  const reset = useCallback(() => {
    resetValues()
    clearAllErrors()
  }, [resetValues, clearAllErrors])

  // 提交处理：校验 + 设 errors + 提交
  const handleSubmit = useCallback(() => {
    const result = validateForm(visibleFields, formValuesRef.current)
    if (!result.valid) {
      setFieldErrors(result.errors)
      return
    }
    setFieldErrors({})
    submit(onSubmit)
  }, [visibleFields, formValuesRef, setFieldErrors, submit, onSubmit])

  // 校验（返回 boolean，匹配 $Form 接口）
  const $validate = useCallback(
    async (name?: string): Promise<boolean> => {
      return validate(formSchema.fields, formValuesRef.current, name)
    },
    [validate, formSchema.fields],
  )

  // ── $form 对象 ──

  const $form: $Form = useMemo(() => ({
    get values() { return formValuesRef.current },
    setFieldValue: $setFieldValue,
    setFieldsValue,
    getFieldValue,
    submit: () => submit(onSubmit),
    reset,
    validate: $validate,
  }), [$setFieldValue, setFieldsValue, getFieldValue, submit, reset, $validate, onSubmit])

  // ── eventContext ──

  const eventContext: EventContext = useMemo(() => ({
    formValues,
    $form,
    callbacks,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [$form, callbacks]) // formValues 通过 $form.values getter 访问，不直接依赖

  return {
    formValues, formValuesRef, visibleFields,
    fieldErrors, fieldOptions,
    handleFieldChange, handleSubmit,
    $form, eventContext, loadDataSource,
    reset, validate: $validate,
  }
}
```

> **注意**：`initialValues` 优先使用 props 传入的 `initialValues`，兜底 `schema.values`。
> `validate` 暴露给 `useImperativeHandle` 消费，返回 `Promise<boolean>` 匹配 `$Form` 接口。

---

## 4. 组件层职责

重构后 `FormRender.tsx` 仅保留 UI 逻辑、渲染和 `forwardRef`：

```typescript
export const FormRender = React.forwardRef<FormRenderHandle, FormRenderProps>(({
  schema, onSubmit, onChange, dataSourceResolver,
  components = {}, desktopAdapter, mobileAdapter,
  scene = 'desktop', initialValues = {},
  loading = false, callbacks = {},
}, ref) => {
  useEnsureDefaultTheme()
  const { token } = useStyle()
  const resolvedAdapter = pickAdapter(desktopAdapter, mobileAdapter, scene) as FormEngineAdapter
  const formConfig = schema.form

  const {
    formValues, visibleFields, fieldErrors, fieldOptions,
    handleFieldChange, handleSubmit, eventContext,
    reset, validate,
  } = useFormRender({ schema, initialValues, onSubmit, onChange, dataSourceResolver, callbacks })

  React.useImperativeHandle(ref, () => ({ submit: handleSubmit, reset, validate }), [handleSubmit, reset, validate])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <form onSubmit={handleFormSubmit} className="fe-form">
      <div className="fe-form-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: token('spacingSm') }}>
        {visibleFields.map((field) => (
          <div key={field.id || field.name} style={{ width: `${((isContainerComponent(field.type) ? 24 : field.colSpan || 24) / 24) * 100}%` }}>
            <NestedFieldRenderer
              field={field}
              formValues={formValues}
              fieldOptions={fieldOptions}
              fieldErrors={fieldErrors}
              loading={loading}
              adapter={resolvedAdapter}
              components={components}
              eventContext={eventContext}
              formConfig={formConfig}
              onFieldChange={handleFieldChange}
            />
          </div>
        ))}
      </div>
    </form>
  )
})
FormRender.displayName = 'FormRender'
```

- `NestedFieldRenderer` 保留在 `FormRender.tsx` 内（仅渲染职责，无逻辑提取价值）
- `useEnsureDefaultTheme` / `useStyle` / `pickAdapter` 保留在组件层（UI 逻辑，不属于 hook）
- 模块级 `debounceTimers` 导出迁移至 `useDataSource.ts` 的 `debounceTimersRef`（仅测试用，加 `@internal` 标注）

---

## 5. 测试策略

### 5.0 基础设施

当前 `packages/core/package.json` **无测试运行时**。重构前需安装依赖：

| 依赖 | 用途 |
|------|------|
| `vitest` | 测试运行器（与项目现有 vite 一致） |
| `@testing-library/react` | React 组件/hook 测试 |
| `@testing-library/jest-dom` | DOM 断言扩展 |
| `jsdom` | DOM 环境 |

### 5.1 前置：回归基线

重构前必须先为 `FormRender` 编写集成测试作为回归基线：

| 场景 | 验证点 |
|------|--------|
| 渲染可见字段 | 字段数量、hidden 过滤、visibleWhen 条件 |
| 字段值变更 | formValues 更新、onChange 回调触发 |
| 表单提交 | 校验通过 → onSubmit、校验失败 → fieldErrors |
| 数据源加载 | static 同步加载、remote 异步加载、依赖变化重载 |
| 重置 | values 恢复、errors 清空 |
| `forwardRef` 暴露 | `submit()` / `reset()` / `validate()` 可调用 |

### 5.2 单元测试（每个 sub-hook 独立测试）

| Hook | 测试重点 | 用例数 |
|------|---------|--------|
| `useFormValues` | setFieldValue 合并、setFieldsValue 批量、reset 恢复初始值、debouncedOnChange 防抖、submit 回调、initialValues 优先级 | 10-12 |
| `useFormValidation` | 必填校验、正则校验、type 校验、clearFieldError、clearAllErrors、validate 返回类型 | 10-12 |
| `useDataSource` | static 加载、remote 加载、依赖追踪、防抖过期丢弃、多实例隔离、fieldDepsSnapshot 快照校验 | 8-10 |
| `useVisibility` | hidden bool/string、visibleIfExpr、visibleWhen、无条件 | 6-8 |

### 5.3 集成测试

- `useFormRender` 聚合 hook：handleFieldChange 联动（设值 + 清 error）、reset 联动、handleSubmit 联动
- `FormRender` 组件：渲染/交互/forwardRef 回归测试（与 5.1 基线对比）

### 5.4 测试工具

- `renderHook`（@testing-library/react）测试 hooks
- `render`（@testing-library/react）测试组件
- `vi.useFakeTimers()` 测试防抖和过期丢弃
- mock `resolveDataSource` 测试数据源异步加载

---

## 6. 迁移步骤

### Phase 0：基础设施 + 回归基线

1. 安装测试依赖（vitest / @testing-library/react / jsdom）
2. 创建 `packages/core/vitest.config.ts`
3. 为 `FormRender` 编写集成测试（5.1 场景）
4. 确认全部测试通过

### Phase 1：提取 sub-hooks（不改组件）

1. 创建 `packages/core/src/renderer/hooks/` 目录
2. 依次提取 `useVisibility`、`useFormValues`、`useFormValidation`、`useDataSource`
3. 每个 hook 单独提交，附带单元测试
4. 组件内逐步替换引用，每步保持编译通过 + 全量测试通过

### Phase 2：组合 useFormRender

1. 创建 `useFormRender.ts` 聚合 4 个 sub-hook + 跨 hook 联动逻辑
2. `FormRender.tsx` 改为调用 `useFormRender`（含 forwardRef 保留）
3. 导出 `useFormRender` 供编程式使用
4. 更新 `renderer/index.ts` 和 `core/index.ts` 导出

### Phase 3：清理

1. 删除 `FormRender.tsx` 中内联的状态/回调
2. 将模块级 `debounceTimers` 导出迁移至 `useDataSource.ts`
3. 跑全量测试 + 构建验证

---

## 7. 执行顺序建议

高内聚、低风险的子模块优先：

```
Phase 0:  测试基础设施搭建 + 回归基线测试
Phase 1a: useVisibility (独立，只依赖 formSchema + formValues)
Phase 1b: useFormValues (独立，只依赖 initialValues + onChange)
Phase 1c: useFormValidation (依赖 formSchema + formValues，通过参数注入)
Phase 1d: useDataSource (依赖最多：formSchema + formValuesRef + setFieldOptions + resolver)
Phase 2:   useFormRender 聚合（含 forwardRef）
Phase 3:   清理与回归
```

---

## 8. 边界与风险

| 风险 | 缓解措施 |
|------|---------|
| hook 间循环依赖（visibility 依赖 values，values 依赖 validation 等） | 设计时校验依赖图，不允许双向依赖；子 hook 间通过参数注入通信，不直接 import |
| 跨 hook 联动遗漏（handleFieldChange 清 error、reset 清 error 等） | 联动逻辑集中在聚合层 `useFormRender`，子 hook 不操作其他 hook 状态 |
| 现有 `$form` 对象的行为变化 | 保持 `$Form` 接口完整兼容，新增不删减 |
| 重构期间组件行为回归 | 每个 Phase 提交后执行 `pnpm test` |
| 外部用户已依赖 `FormRender` 内部状态 | `useFormRender` 作为新导出，不破坏旧 API |
| `forwardRef` 暴露的方法变化 | 保持 `FormRenderHandle` 接口不变：`submit()` / `reset()` / `validate(name?)` |
| `initialValues` prop 变化时 formValues 不同步 | 保持现状（`useState` 只初始化），如需同步在聚合层加 `useEffect` |
| `formSchema` 的 `useMemo(() => schema, [schema])` 无稳定引用效果 | 保留现状，后续可改用 `useRef` + 浅比较 |
| `validate` 返回类型变更（`ValidateResult` vs `boolean`） | `useFormValidation` 同时暴露 `validate`（boolean）和 `validateRaw`（完整结果），聚合层按需使用 |
| `useDataSource` 依赖变化 effect 的触发源 | 聚合层传入 `formValues` 作为依赖，hook 内部通过 `formValuesRef.current` 读取最新值 |
| 模块级 `debounceTimers` 导出迁移 | 移至 `useDataSource.ts` 的 `debounceTimersRef` 并标注 `@internal`，仅测试使用 |
