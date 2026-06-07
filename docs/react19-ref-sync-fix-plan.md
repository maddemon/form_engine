# React 19 "Cannot access refs during render" 修复方案

## 背景

React 19 禁止在 **render 阶段**（函数体顶层）写 `ref.current`。当前代码库有 6 个文件共 8 处在 render 阶段写 ref，触发此错误。

## 总览

| # | 文件 | 行号 | 问题 | 修复方式 | 风险 |
|---|---|---|---|---|---|
| 1 | `useFormValues.ts` | 23 | `formValuesRef.current = formValues` | 移到 `useEffect` | 低（详见下文） |
| 2 | `useFormValues.ts` | 27 | `onChangeRef.current = onChange` | 移到 `useEffect` | 低 |
| 3 | `useFormValues.ts` | 50 | `onChangeRef.current?.(next)` 在 setState updater 里 | 捕获 `next` 移到 updater 外调用 | 低 |
| 4 | `Designer.tsx` | 25-27 | `indexRef.current` + `prevFieldsRef.current` | 改用 `useMemo` | 极低 |
| 5 | `useDesignerSync.ts` | 14 | `onSchemaChangeRef.current = onSchemaChange` | 移到 `useEffect` | 低 |
| 6 | `ExpressionInput.tsx` | 92 | `onChangeRef.current = onChange` | 移到 `useEffect` | 低 |
| 7 | `Select.tsx` | 18 | `onChangeRef.current = onChange` | 移到 `useEffect` | 低 |
| 8 | `OptionsEditor.tsx` | 121 | `internalRef.current = internal` | 移到 `useEffect` | 低 |

> **已排除**：`useDebouncedInput.ts` 之前有相同的 `onChangeRef.current = onChange` 只在 render 阶段的模式，但当前代码已经用 `useEffect` 包裹（第 18-20 行），无需修复。注意其写法是无 deps 的 `useEffect`，与本文档推荐的"加 deps"风格不同，功能等价，暂不统一。

---

## 逐文件详细方案

### 1. `useFormValues.ts` — 最需要谨慎的文件

#### 问题具体分析

```ts
// 当前代码
const formValuesRef = useRef(formValues)
formValuesRef.current = formValues          // ← 问题 A：render 阶段写 ref

const onChangeRef = useRef(onChange)
onChangeRef.current = onChange               // ← 问题 B：render 阶段写 ref

const setFieldsValue = useCallback((patch) => {
  setFormValues((prev) => {
    const next = { ...prev, ...patch }
    onChangeRef.current?.(next)              // ← 问题 C：setState updater 内调回调
    return next
  })
}, [])
```

`formValuesRef` 被以下路径消费，需逐一验证安全性：

- **`debouncedOnChange`**：`setTimeout` 后读 `formValuesRef.current`。setTimeout 即使 delay=0 也在 effect flush 之后，此时 ref 已同步 → **安全**
- **`submit`**：读 `formValuesRef.current`，从 `useFormRender` 来看，`submit` 由 `$form.submit()` 触发，调用方是事件处理器（点击提交按钮），此时组件已提交、effect 已运行 → **安全**
- **`useFormRender.handleSubmit`**（`useFormRender.ts` 第 94 行）：读 `formValuesRef.current`，调用自事件处理器 → **安全**
- **`useDataSource`**：读 `formValuesRef.current`，在 effect 中 → **安全**

`onChangeRef` 被以下路径消费：

- **`setFieldValue`**：`debouncedOnChange()` 中通过 `onChangeRef.current` 调用。debounce 定时器 → **安全**
- **`setFieldsValue`**：本来就是问题点，要修复
- **`reset`**：`setFormValues` 之后在事件处理器上下文调 `onChangeRef.current?.(initialValues)` — 注意这里已经**不在 updater 里了**，当前代码没问题（问题只在第 50 行）

#### 修复方案

##### 修改 A / 修改 B：ref 同步移到 useEffect

方案 → 全部统一加 deps + disable 注释（与 `OptionsEditor.tsx` 风格一致，见下文）：

```ts
const formValuesRef = useRef(formValues)
const onChangeRef = useRef(onChange)

useEffect(() => {
  formValuesRef.current = formValues
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [formValues])
useEffect(() => {
  onChangeRef.current = onChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [onChange])
```

> **为什么加 deps 还要加 disable 注释？**
> `react-hooks/exhaustive-deps` 在 deps 齐全的情况下不会报 warning。这里加 disable 注释是因为需要预防特殊情况（例如未来某天 React 编译器要求只使用 `ref` 而不依赖外部值），但更实际的原因是编写时避免 lint 误报。实际上 `[formValues]` 和 `[onChange]` 是完整的 deps，不会触发 lint 警告。如果不加 disable 注释也 OK，加了只是防御性书写。
>
> 如果倾向于不加 disable 注释，直接写 `[formValues]`、`[onChange]` 即可：
> ```ts
> useEffect(() => { formValuesRef.current = formValues }, [formValues])
> useEffect(() => { onChangeRef.current = onChange }, [onChange])
> ```
> 两者语义等价——"当值变化时同步到 ref"。两种写法均可。

##### 修改 C：setFieldsValue 中去掉 updater 内回调

**问题**：`setFormValues` 的 updater 函数内调用 `onChangeRef.current?.(next)` 有两层问题：

1. **Updater 纯净性**：`setState` updater 应为纯函数，不应有副作用。调用外部回调是副作用，Strict Mode 下会被执行两次，可能导致重复通知。
2. **面向编译器**：React Compiler 假定 updater 是纯函数，内含 ref 读取/回调调用会阻碍优化甚至产生误报。

> React 19 **运行时**只拦截**写** `ref.current`（`ref.current = ...`），不拦截读。Fix C 的必要性来自上述两条，而非运行时限制。

**方案**：用局部变量捕获 updater 计算的 `next` 值，将 `onChange` 调用移到 updater 之外：

```ts
const setFieldsValue = useCallback((patch: Record<string, unknown>) => {
  let next: Record<string, unknown>
  setFormValues((prev) => {
    next = { ...prev, ...patch }
    return next
  })
  // React 的 setState updater 函数保证同步执行（内部实现确定性行为，React 16-19 均如此），
  // 因此 `next` 在此处已被赋值。将 onChange 调用提到 updater 外部，避免在 render 阶段操作 ref。
  // 带 ! 断言是因为 TypeScript 无法推导出 let 变量在 setState 后被赋值。
  onChangeRef.current?.(next!)
}, [])
```

**为什么不直接用 `formValuesRef.current` 合并？**

```ts
const next = { ...formValuesRef.current, ...patch }
setFormValues(next)
onChangeRef.current?.(next)
```

因为 `formValuesRef.current` 是上一个 commit 后的值。如果同一批中有多个 `setFormValues` 调用（React 18 自动批处理），`formValuesRef.current` 尚未更新，合并会丢中间状态。用 updater 内的 `prev` 捕获保证总是基于最新的 pending state 合并。

**为什么不直接在 updater 里调 `onChange`？**

React 19 的严格模式 + React Compiler 会对 updater 内的 ref 读写一并拦截。即使当前可能不报错，未来编译优化时也会出问题。将 `onChange` 移出 updater 是面向未来的写法。

**为什么不担心循环问题？**

- `onChangeRef.current?.(next!)` 调用的是外部传入的 `onChange` 回调
- 如果外部回调又调用了 `setFieldsValue`，在当前代码中也会发生（只是 timing 不同），并非新引入
- 外部回调通常更新的是**父组件状态**，不会导致 `useFormValues` 内部的 `formValues` 状态循环
- 如果外部回调修改了 `initialValues` prop，`useFormValues` 只在 mount 时读一次 `initialValues`（`useState`），不会形成循环

---

### 2. `Designer.tsx` — `useFieldIndex`

**当前实现**：手动用 ref 缓存上一次 `fields` 和执行结果，引用变化时重建索引（含一层内容浅比较：`fields.length !== prev.length || fields.some((f, i) => f !== prev[i])`）。

**修复方案**：直接用 `useMemo` 替换，行为等价且无需 ref。

```ts
function useFieldIndex(fields: FormFieldSchema[]): FieldIndex {
  return useMemo(() => buildFieldIndex(fields), [fields])
}
```

- `buildFieldIndex` 是纯函数，`useMemo` 在 deps 不变时返回缓存值
- 与原始实现**行为等价**——原实现的浅比较优化在不可变数据流下与 `useMemo` 的引用比较一致
- 零风险

---

### 3. `useDesignerSync.ts`

**当前代码**：

```ts
const onSchemaChangeRef = useRef(onSchemaChange)
onSchemaChangeRef.current = onSchemaChange     // ← render 阶段写 ref
```

**修复**：

```ts
const onSchemaChangeRef = useRef(onSchemaChange)
useEffect(() => {
  onSchemaChangeRef.current = onSchemaChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [onSchemaChange])
```

`onSchemaChangeRef` 只在第 27 行的 `useEffect` 内被读取（`useDesignerSync.ts` 第 27 行），effect 执行时 ref 已同步 → **安全**

---

### 4. `ExpressionInput.tsx`

```ts
const onChangeRef = useRef(onChange)
useEffect(() => {
  onChangeRef.current = onChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [onChange])
```

---

### 5. `Select.tsx`

```ts
const onChangeRef = React.useRef(onChange)
React.useEffect(() => {
  onChangeRef.current = onChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [onChange])
```

---

### 6. `OptionsEditor.tsx`

**当前代码**：

```ts
const internalRef = useRef(internal)
internalRef.current = internal             // ← render 阶段写 ref
```

**修复**：

```ts
const internalRef = useRef(internal)
useEffect(() => {
  internalRef.current = internal
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [internal])
```

`internalRef` 有两个写入源：

| 来源 | 时机 | 代码 |
|---|---|---|
| `useEffect` | 每次 `internal` 变化后的 commit 阶段 | `internalRef.current = internal` |
| `update` / `add` / `remove` / `handleSortEnd` | 事件处理器中（乐观更新） | `internalRef.current = next` |

事件处理器中的 `internalRef.current = next` 是乐观更新——在 `setInternal(next)` 后立即写 ref，避免等下一轮 effect。这两者**不冲突**：effect 负责同步外部变化（value prop → internal），事件处理器负责同步内部操作的中间状态。

`internalRef` 在上述四个回调中被读取——这些都是在事件处理器中执行，ref 在前一次 effect 或本回调的乐观更新中已是最新值。

注意：此处加了 `[internal]` deps，与上面其他文件的 `useEffect` 风格统一。所有"sync ref" effect 均采用 **加 deps + optional eslint disable 注释** 的方式。

---

## 共性风险：useEffect 的时序间隙

所有从 render 阶段移到 `useEffect` 的 ref 同步，都存在一个理论时序窗口：

- render 阶段 → ref 写入
- commit → DOM 更新
- **间隙**：此 commit 到 effect 执行之间
- useEffect 执行 → ref 同步

若在 render 与 effect 之间有代码读取 ref，拿到的是**旧值**。

### 实际安全分析

| 场景 | 风险 |
|---|---|
| **事件处理器**（点击、输入等） | **安全** — 由用户交互触发，此时 effect 早已执行完毕 |
| **`useEffect` 内的读取** | **安全** — 本 effect 或依赖链中更早的 effect 已执行 |
| **`useImperativeHandle` 暴露的方法被父组件调用** | **需注意** — 若父组件在同一 render 周期内（如 `useLayoutEffect` 中）调用子组件暴露的方法，读到的是旧值 |

当前代码库中所有 ref 的消费路径均已验证为事件处理器或 effect（见各文件分析），实际安全。

---

## 关于 `formValuesRef` 暴露在公共 API

`UseFormValuesResult`（`useFormValues.ts:10`）暴露了 `formValuesRef`：

```ts
export interface UseFormValuesResult {
  formValues: Record<string, unknown>
  formValuesRef: { current: Record<string, unknown> }  // ← 外部可访问
  ...
}
```

修复前 ref 在 render 阶段同步（`formValuesRef.current = formValues`），外部读取始终最新。修复后 ref 在 `useEffect` 中同步，外部直接读 `formValuesRef.current` 可能比 `formValues` 状态落后一个 render。

### 不影响内部消费

`useFormRender`、`useDataSource` 等内部消费者在事件处理器/effect 中读 ref，时序安全（见上文分析）。

### 外部消费者风险

外部代码（如自定义 hook 或 adapter）若直接读 `formValuesRef.current` 而非 `formValues`，可能读到旧值。

**建议**：考虑在类型中移除 `formValuesRef`，强制外部使用 `formValues`。如不能移除，至少应在 API 文档标注此时序窗口。

---

## 关于 useEffect deps 的 lint 问题

`react-hooks/exhaustive-deps` 规则对 `useEffect` 中使用了但未在 deps 中声明的变量会报 warning。

三个方案对比：

| 方案 | 代码 | lint 状态 | 语义 |
|---|---|---|---|
| 无 deps + disable 注释 | `useEffect(() => { ref.current = val }) // eslint-disable-line` | 无 warning | "每次 render 后执行" |
| 加 deps | `useEffect(() => { ref.current = val }, [val])` | 无 warning | "val 变化时执行" |
| 加 deps + disable 注释 | `useEffect(() => { ref.current = val }, [val]) // eslint-disable-line` | 无 warning | 同上，防御性 |

对 sync-ref 场景，三者**功能等价**（val 变化 → render → effect → ref 更新）。本文档统一采用**加 deps** 方式，标注 disable 注释仅作防御性书写，实际不触发 lint 警告。

---

## 测试建议

### 验证清单

1. **`useFormValues.test.ts`**：运行现有测试确保全部通过
2. **手动验证**：渲染表单，修改字段值，提交表单，确认 onChange 正常触发
3. **`Designer.tsx`**：拖拽字段、切换字段列表，确认索引重建正常
4. **`useDesignerSync.ts`**：修改 schema 后保存，确认内外同步正常
5. **`ExpressionInput`**：打开/关闭表达式弹窗，修改值，确认 onChange 正常
6. **`Select`**：下拉选择/清除，确认 onChange 正常
7. **`OptionsEditor`**：添加/编辑/删除/排序选项，确认 behaviors 正常

### 回归关注点

- `setFieldsValue` 的 `onChange` 时序：修复前后都是**同步**调用，且在同一个事件处理器/调用栈中。React 18 自动批处理对两者行为一致——`onChange` 触发的父组件状态更新与 `setFormValues` 合并批处理。**行为等价，无需担心**。
- `useFieldIndex` 从 ref 改为 `useMemo`：行为等价（原实现多一层内容的浅比较优化，`useMemo` 每次 fields 引用变化都重建，结果一致）

### 测试项补充

| 场景 | 说明 |
|---|---|
| `setFieldsValue` 连续调用 | 同一事件处理器内连续调用两次 `setFieldsValue({a:1})` + `setFieldsValue({b:2})`，验证第二次合并基于第一次的结果（`{a:1, b:2}`），且 `onChange` 被调用两次 |
| `submit` 在 `setFieldValue` 后立即调用 | 验证 `formValuesRef.current` 是最新值 |
| Strict Mode 双重渲染 | 开发模式下验证所有修复不产生重复副作用 |

---

## 回滚策略

如果某个修复引入问题，可以**单文件回滚**，互不影响。建议按文件逐个修复、逐个测试。

实现顺序（按风险升序）：
1. `Designer.tsx`（useMemo — 零风险）
2. `useDesignerSync.ts`（单一 ref + 简洁的 effect）
3. `ExpressionInput.tsx` / `Select.tsx`（简单替换）
4. `OptionsEditor.tsx`（单个 ref + effect）
5. `useFormValues.ts`（3 处修改，需重点测试 onChange 行为）

---

## 交接备忘（给下一位实现者）

### 文件名对照

文档中文件名是简写，实际路径在 `packages/core/src/` 下：

| 文档名 | 实际路径 |
|---|---|
| `useFormValues.ts` | `packages/core/src/renderer/hooks/useFormValues.ts` |
| `Designer.tsx` | `packages/core/src/designer/Designer.tsx` |
| `useDesignerSync.ts` | `packages/core/src/designer/useDesignerSync.ts` |
| `ExpressionInput.tsx` | `packages/core/src/widgets/ExpressionInput.tsx` |
| `Select.tsx` | `packages/core/src/widgets/Select.tsx` |
| `OptionsEditor.tsx` | `packages/core/src/widgets/OptionsEditor.tsx` |

### OptionsEditor 不需要动的行

`OptionsEditor.tsx` 中还有多处 `ref.current = x`，但都在事件处理器或 effect 中，**无需修改**：

- 第 59 行 `prevOpenRef.current = open` — 在 `useEffect` 内
- 第 113 行 `prevValueRef.current = value` — 在 `useEffect` 内
- 第 128、138、147、163 行 `internalRef.current = next` — 在事件处理器（`useCallback`）内，属于"乐观更新"模式

### 一个已知问题：`internalRef.current = next` 冗余

修复后 `OptionsEditor` 的事件处理器中仍保留 `internalRef.current = next`（第 128、138、147、163 行），与 effect 的写入构成"双写"。这不是 bug，但可以后续清理——如果事件处理器中不需要同步读 `internalRef`，可以去掉这些乐观更新，完全依赖 effect。

### 修复后验证命令

```bash
# 1. lint 无新增错误
pnpm lint

# 2. 类型检查
pnpm --filter @form-engine/core type-check

# 3. 现有测试
pnpm --filter @form-engine/core test -- --run

# 4. 检查硬编码样式（build 自动跑，也可单独跑）
pnpm check:tokens

# 5. 全量构建
pnpm build

# 6. 启动 demo 手动验证
pnpm dev:example
```