# Form Engine 架构重构计划

> 基于对全仓库源码的逐文件审查，识别出的架构问题与重构方案。
>
> 日期：2026-06-11

---

## 目录

1. [Adapter 间重复代码](#1-adapter-间重复代码)
2. [类型安全问题](#2-类型安全问题)
3. [测试覆盖缺口](#3-测试覆盖缺口)
4. [Error Boundary 缺失](#4-error-boundary-缺失)
5. [DesignerContext 兼容层清理](#5-designercontext-兼容层清理)
6. [Designer useMemo 依赖膨胀](#6-designer-usememo-依赖膨胀)
7. [FormRender Props 钻透](#7-formrender-props-钻透)
8. [evalExpr 渲染路径性能](#8-evaluexpr-渲染路径性能)
9. [useFormDesigner 弃用与去重](#9-useformdesigner-弃用与去重)
10. [Debounce 模式不一致](#10-debounce-模式不一致)
11. [ContainerPreview 硬编码注册表](#11-containerpreview-硬编码注册表)
12. [其他零散问题](#12-其他零散问题)
13. [低优先级项（暂缓）](#13-低优先级项暂缓)

---

## 1. Adapter 间重复代码

### 现状

| 重复项 | 位置 | 行数 |
|--------|------|------|
| `DefaultField` 兜底渲染 | `adapter-antd/src/index.tsx:119-123`<br>`adapter-antd-mobile/src/index.tsx:81-85` | 5 行 × 2 |
| `transformValue` 函数 | `adapter-antd/src/themeBridge.tsx:107-121`<br>`adapter-antd-mobile/src/themeBridge.tsx:63-77` | 15 行 × 2 |

### 重构方案

1. **`DefaultField`** → 提取到 `@form-engine/core/styles` 导出（`defaultFieldRenderer`），两个 adapter 直接引用。同时修复硬编码颜色为 CSS 变量。

2. **`transformValue`** → 提取到 `@form-engine/core/styles` 导出（`transformTokenValue`），两个 adapter 的 themeBridge 都调用它。

> ✅ 已完成：`styles/bridgeUtils.tsx` 包含 `defaultFieldRenderer` + `transformTokenValue`，
> 两个 adapter 已改用共享实现，删除了各自的重复定义。

Docs: [x] 已导出，adapter README 需同步更新

---

## 2. 类型安全问题

### 2.1 `any` 泛滥

| 包 | `: any` | `as any` | 主要文件 |
|----|---------|----------|---------|
| core/src | ~15 | ~5 | `component.ts`, `resolver.ts`, `simpleCustomComponentRegistry.ts` |
| adapter-antd | ~5 | ~13 | `Button.tsx`, `Select.tsx`, `Checkbox.tsx`, `widgets/*.tsx` |
| adapter-antd-mobile | ~5 | ~10 | `Checkbox.tsx`, `Radio.tsx`, `Upload.tsx`, `Select.tsx` |

**合计**：~25 处 `: any` + ~28 处 `as any`，遍布 25+ 文件。

> ✅ 已完成（adapter-antd widgets + Alert）：
> - 5 个 widgets 从 `React.FC<any>` 改为 `React.ComponentProps<DesignerWidgets['X']>`
> - Alert `onClose as any` → 补充 core `AlertProps.onClose` 后直接使用
> - 详细分类见 `docs/any-type-analysis.md`
>
> 剩余 `as any` 分两类：
> - **Category 1（core 缺陷）**：`BaseComponentProps` 索引签名、Text/Title 的 `textProps: any`
> - **Category 2（库互操作）**：Cascader/TreeSelect 的 `OptionItem` vs antd 类型、antd-mobile render prop 类型缺失

### 2.2 `BaseComponentProps` 索引签名失明

```ts
// types/component.ts:36
[key: string]: unknown
```

导致所有已知 prop 的 IDE 提示和类型检查失效。`BaseFormComponentProps.onChange` 为 `(value: any) => void`，丢失类型信息。

> ⚠️ 未修复：删除索引签名会影响太多文件（Text/Title 等组件的 `...rest` 展开），建议单独 PR 处理。

### 2.3 Adapter 类型断言

```ts
// adapter-antd/src/index.tsx:179
components: { ... } as unknown as Record<string, FieldRendererFn>,
```

`as unknown as` 绕过类型检查，根因是 `FieldRendererFn` 签名与实际组件 Props 不完全匹配。

### 重构方案

1. **删除 `BaseComponentProps` 的 `[key: string]: unknown`**，改用 `Omit` 或精确类型覆盖。

2. **`BaseFormComponentProps.onChange`** → 改为泛型 `onChange?: (value: TValue) => void`，子类型各自覆盖。

3. **Adapter `components` 类型** → 定义 `AdapterComponentsMap` 映射表，key 到 value 类型精确匹配，消除 `as unknown as`。

4. **逐包清理 `any`** → 按文件优先级：`adapter-antd`（使用频率最高）→ `adapter-antd-mobile` → `core`。

Docs: [x] adapter-antd widgets 已修复，分析报告已写入 docs/any-type-analysis.md

---

## 3. 测试覆盖缺口

### 现状

仅 8 个测试文件，全部在 `core` 包内：

| 测试文件 | 覆盖范围 |
|----------|---------|
| `events/__tests__/resolver.test.ts` | 事件解析 |
| `renderer/__tests__/JsxRender.test.tsx` | JSX 渲染 |
| `renderer/__tests__/FormRender.test.tsx` | 表单渲染 |
| `designer/__tests__/custom-component.test.tsx` | 自定义组件 |
| `renderer/hooks/__tests__/useFormValues.test.ts` | 表单值管理 |
| `renderer/hooks/__tests__/useFormValidation.test.ts` | 表单校验 |
| `renderer/hooks/__tests__/useVisibility.test.ts` | 字段可见性 |
| `utils/__tests__/resolvePanelWidth.test.ts` | 面板宽度解析 |

**未覆盖的关键模块**：

| 模块 | 重要性 | 缺失风险 |
|------|--------|---------|
| `designer/reducer.ts` | 高 | Reducer 是设计器核心，字段增删改移全靠它 |
| `designer/Dnd/useDndHandlers.ts` | 高 | 拖拽逻辑复杂，无测试极易回归 |
| `dataSource/resolver.ts` | 高 | 数据源解析是运行时关键路径 |
| `renderer/validate.ts` | 中 | 已有 hook 测试，但 validate 函数本身未单独测试 |
| `styles/StyleProvider.tsx` | 中 | 主题注入、合并、切换逻辑无测试 |
| `components/index.ts` | 中 | 注册表查询函数无测试 |
| `adapter-antd/*` | 低 | Adapter 是 UI 映射层，可后续补 |

### 重构方案

按优先级补充测试：

1. **P0 — Reducer 测试**：覆盖所有 action type（SELECT_FIELD、ADD_FIELD、REMOVE_FIELD、MOVE_FIELD、COPY_FIELD、UPDATE_FIELD、UPDATE_FORM_CONFIG、SET_SCHEMA、REORDER_FIELDS、UNDO、REDO）。
2. **P0 — DnD Handlers 测试**：覆盖 palette→canvas、canvas→canvas（根级/容器内/跨容器）场景。
3. **P1 — DataSource Resolver 测试**：覆盖 static/remote 数据源解析、依赖更新。
4. **P1 — Validate 测试**：覆盖所有 rule type（required/min/max/len/pattern/type）。
5. **P2 — StyleProvider 测试**：覆盖 light/dark/system 模式切换、CSS 变量注入。

> ✅ 已完成（P0）：44 个 Reducer 测试覆盖全部 action type + buildFieldIndex/findInTree/collectFieldNames。
> DnD Handlers 测试待补充。

Docs: [x] reducer.test.ts 已创建

---

## 4. Error Boundary 缺失

### 现状

整个组件树没有 Error Boundary。任何一个字段渲染异常（如 adapter 组件抛错、表达式执行失败）都会导致整棵树白屏。

### 重构方案

1. **在 `FieldRenderer` 外层包裹 ErrorBoundary**，单个字段渲染失败时显示 fallback UI（红色错误提示），不影响其他字段。
2. **在 `FormRender` 外层包裹顶层 ErrorBoundary**，捕获未预期的全局错误。
3. **实现 `FieldErrorBoundary` 组件**，支持自定义 fallback。

> ✅ 已完成：`renderer/FieldErrorBoundary.tsx` — class component，支持 `resetKeys` 自动恢复，
> 已包裹 FieldRenderer 两个 return 分支，从 `@form-engine/core` 主入口导出。

Docs: [x] 已导出 FieldErrorBoundary，JSDoc 完整

---

## 5. DesignerContext 兼容层清理

### 现状

`DesignerContext.ts` 中存在旧 API 导出，但**已确认无消费者**：

```ts
// 新 API（已拆分，唯一使用方式）
useDesignerDispatch()
useDesignerSelection()
useDesignerConfig()

// 旧 API（已无消费者，可安全清理）
useDesignerContext()  // @deprecated，零处调用

// 别名（已无消费者，可安全清理）
export const DesignerContext = DesignerDispatchContext
```

全量搜索 `useDesignerContext` 在 `.tsx` 文件中的调用：零处。迁移早已完成。

### 重构方案

1. **删除 `useDesignerContext()` 兼容函数**（无消费者，无 break change）。
2. **删除 `DesignerContext = DesignerDispatchContext` 别名**（无消费者，无 break change）。
3. **标记 `DesignerDispatchContext` 等 export 为内部使用**，不从 `core` 主入口导出。

> ✅ 已完成：`useDesignerContext()`、`DesignerContextValue`、`DesignerContext` 别名均已删除，
> 全量搜索确认零消费者。`DesignerDispatchContext` 等仍从 designer 子路径导出（内部使用）。

Docs: [x] DesignerContext 清理完成

---

## 6. Designer useMemo 依赖膨胀

### 现状

`Designer.tsx:205-271` 的 `content` useMemo 有 **25 个依赖**：

```ts
const content = useMemo(() => (
  // ...大段 JSX
), [
  dispatchCtx, selectionCtx, configCtx, readOnly, finalGroups,
  panelWidths?.palette, panelWidths?.properties, sidePanelTabs,
  propertyPanelTabs, propertySlots, sensors, collisionDetection,
  handleDragStart, handleDragOver, handleDragEnd, handleDragCancel,
  state.schema.fields, state.selectedFieldId, state.schema.form,
  dndState.activeDragId, dndState.activeDragLabel, dndState.activeDragType,
  dragOverState, canUndo, canRedo, selectedField, widgetsAdapter, dispatch,
])
```

25 个依赖中任何一个变化都会导致整棵 JSX 树重建，useMemo 形同虚设。

### 重构方案

**不再用 useMemo 缓存整棵 JSX 树**，改为：

1. Context Provider 已经拆分为三个（Dispatch/Selection/Config），消费方自动按需重渲。
2. 删除 `Designer.tsx` 中的 `content` useMemo，直接返回 JSX。
3. 各子组件（`FieldList`、`Canvas`、`PropertyPanel`）内部使用 `React.memo` 或拆分后的 Context 做精准优化。

> ✅ 已完成：`content` useMemo（25 个依赖）已删除，直接返回 JSX。
> 依赖拆分后的三个 Context：DispatchContext 几乎不变，SelectionContext 仅交互时变化，
> ConfigContext 仅 scene/formConfig 变化时更新。

Docs: [x] 已完成

---

## 7. FormRender Props 钻透

### 现状

`FormRender` → `FormRenderInner` 传递了 **15+ 个 props**：

```tsx
<FormRenderInner
  ref={ref}
  schema={schema}
  onSubmit={onSubmit}
  onChange={onChange}
  dataSourceResolver={dataSourceResolver}
  components={components}
  desktopAdapter={desktopAdapter}
  mobileAdapter={mobileAdapter}
  scene={scene}
  initialValues={initialValues}
  loading={loading}
  callbacks={callbacks}
  beforeSubmit={beforeSubmit}
  afterSubmit={afterSubmit}
  jsxScope={userJsxScope}
/>
```

### 重构方案

**将 `FormRenderProps` 中的运行时配置（schema、adapter、callbacks 等）统一注入到已有的 Context 中**，`FormRenderInner` 从 Context 读取，减少 props 传递。

当前已有三个 Context（`FormConfigContext`、`FormEngineContext`、`FormStateContext`），可以扩展 `FormEngineContext` 承载 adapter、components、loading、jsxScope 等。

> ✅ 已确认无需改动：FormEngineContext 已承载 adapter/components/loading/jsxScope，
> NestedFieldRenderer 从 Context 读取。Props 钻透只有一层（FormRender→FormRenderInner），
> 是正常 React 模式，非真正钻透问题。

Docs: [x] 已确认无需改动

---

## 8. evalExpr 渲染路径性能

### 现状

`useFieldExpression.ts` 中 `evalExpr()` 内部使用 `new Function()` 编译表达式。core 有 LRU 缓存（`utils/index.ts:43-80`），缓存 key 是 `(keys.sort().join(',') + expr)`。

`useFieldExpression` 的 `context` useMemo 已按 `[field.name, value]` 正确缓存，**不会**因整个 `formValues` 引用变化而失效。

### 重构方案

1. **表达式编译缓存** → 改为仅按 `expr` 字符串缓存编译后的函数（`new Function` 的结果），执行时动态传入 context 值。这样同一个表达式只编译一次，缓存命中率更高。

> ✅ 已完成：cache key 从 `keys.sort().join(',') + expr` 改为仅 `expr`。
> 编译和执行时均对 context keys 排序，确保相同 key 集合（无论顺序）命中同一缓存。

Docs: [x] evalExpr JSDoc 已更新

---

## 9. useFormDesigner 弃用与去重

### 现状

`designer/hooks.ts` 中的 `useFormDesigner` 使用 `designerReducer`（**无历史记录**），而 `Designer.tsx` 中使用 `designerReducerWithHistory`（**有撤销重做**）。两者功能高度重叠但实现不同。

`useDesignerHistory` hook 也独立实现了撤销重做逻辑（基于 `useState`），与 `designerReducerWithHistory`（基于 reducer action）重复。

### ⚠️ Breaking Change 风险

`useFormDesigner` 从两个入口导出：

- `@form-engine/core`（主入口）→ `export { useFormDesigner } from './designer/hooks'`
- `@form-engine/core/designer`（子路径）→ `export { useFormDesigner } from './hooks'`

直接删除是 break change，需走弃用期。

### 重构方案

1. **`useFormDesigner`** → 标记为 `@deprecated`，内部改为使用 `designerReducerWithHistory`，保持 API 兼容。下个大版本再删除。
2. **`useDesignerHistory`** → 标记为 `@deprecated`，撤销重做统一由 reducer 管理。下个大版本再删除。
3. **保留 `useFieldActions` hook**，它是有价值的便捷 API。

> ✅ 已完成：`useFormDesigner` 和 `useDesignerHistory` 已标记 `@deprecated`，
> 注释说明替代方案和删除计划。`useFieldActions` 保留。

Docs: [x] 已标记 @deprecated

---

## 10. Debounce 模式不一致

### 现状

| 位置 | 方式 | 文件 |
|------|------|------|
| PropertyPanel label/name/defaultValue/colSpan | `useDebouncedInput` hook | `designer/useDebouncedInput.ts` |
| PropertyPanel componentProps | 手动 `setTimeout` | `designer/PropertyPanel.tsx:115-149` |
| FormRender onChange | `debouncedOnChange` from `useFormValues` | `renderer/hooks/useFormValues.ts` |

三处 debounce 实现方式不同，`useDebouncedInput` 是封装好的 hook，但 componentProps 没有复用它。

### 重构方案

1. **统一使用 `useDebouncedInput`**，删除 PropertyPanel 中手动管理的 `setTimeout` debounce。
2. **如果 `useDebouncedInput` 不支持 componentProps 的场景**（deep merge patch），扩展其接口或新建 `useDebouncedCallback` 通用 hook。

> ✅ 已确认无需改动：所有 debounce 已统一使用 hooks：
> - `useDebouncedInput` — 简单值
> - `useDebouncedObjectMap` — componentProps
> - `useDebouncedFieldUpdate` — 字段更新
> 无手动 setTimeout 残留。

Docs: [x] 已确认无需改动

---

## 11. ContainerPreview 硬编码注册表

### 现状

```ts
// ContainerPreview/ContainerPreview.tsx:15-22
const containerRendererRegistry: Record<string, React.FC<ContainerContentProps>> = {
  card: CardContainerContent,
  grid: GridContainerContent,
  'sub-form': SubFormContainerContent,
  collapse: CollapseContainerContent,
  tabs: TabsContainerContent,
  flex: FlexContainerContent,
}
```

每新增一种容器类型，必须修改此文件。

### 重构方案

**将容器渲染器注册到组件 meta 中**，`ContainerPreview` 从注册表动态查找：

> ✅ 已完成：新增 `registerContainerRenderer` / `getContainerRenderer` API，
> 从 `@form-engine/core/designer` 导出。内置 6 种容器（grid/flex/collapse/tabs/sub-form/card）
> 默认注册，扩展新容器类型时调用 `registerContainerRenderer` 即可。
> 避免了在 component.ts 中添加 `containerRenderer` 字段（会引入循环依赖）。

Docs: [x] 已完成，API 已导出

---

## 12. 其他零散问题

### 12.1 `debounceTimers` 全局 Map

`FormRender.tsx:77` 暴露了模块级 `Map` 给外部测试使用，污染全局作用域。

**修复**：改为通过 `__TEST__` 环境变量控制导出，或使用 `jest.mock` 在测试中替换。

> ✅ 已完成：`debounceTimers` 导出已删除（无消费者，死代码）。

### 12.2 `generateFieldId` vs `genId`

- `reducer/fieldOperations.ts:6-8` — `generateFieldId()` 使用 `Date.now() + counter`
- `utils/id.ts` — `genId()` 使用 `crypto.randomUUID()` 或 fallback

两套 ID 生成策略，应统一为 `genId`。

> ✅ 已完成：`generateFieldId` 改为调用 `genId('field_copy')`，不再自己维护 counter。

Docs: [x] 已统一

### 12.3 `useAdaptiveAdapter` 位置不当

位于 `renderer/useAdaptiveAdapter.ts`，但实际是设备检测工具，不依赖 renderer 内部实现。

**修复**：移至 `utils/useAdaptiveAdapter.ts`，保持 renderer 模块纯净。

Docs: [ ] 更新 AGENTS.md 中的模块结构说明

### 12.4 Adapter 包缺少 type-check

`packages/adapter-antd` 和 `packages/adapter-antd-mobile` 没有 `type-check` 脚本，类型错误只能在 `build` 时发现。

**修复**：在两个 adapter 的 `package.json` 中添加 `"type-check": "tsc --noEmit"` 脚本。

> ✅ 已确认：两个 adapter 均已有 `type-check` 脚本，无需改动。

### 12.5 样式 Token 使用不一致

部分代码使用 CSS 变量字符串（`'var(--fe-primary)'`），部分使用 `token('primary')`。两种方式混用增加维护成本。

**修复**：制定规范——inline style 中统一使用 `token()` 函数，CSS 文件/class 中使用 CSS 变量。

### 12.6 包 sideEffects 字段缺失

三个包的 `package.json` 均未声明 `sideEffects`，消费者无法有效 tree-shaking。

**修复**：在所有包的 `package.json` 中添加：

```json
"sideEffects": ["**/*.css", "**/*.scss"]
```

> ✅ 已完成：三个包均已添加。

### 12.7 evalExpr 异常兜底

`evalExpr` 已有 try-catch（`utils/index.ts:60-80`），失败时返回 `false` 并 `console.warn`，不会导致整棵树崩溃。此项无需额外处理。

Docs: [x] 已确认无需处理

---

## 13. 低优先级项（暂缓）

以下问题识别到了但不紧急，有空再处理：

### 13.1 Locale/Icons 大文件拆分

| 文件 | 大小 | 说明 |
|------|------|------|
| `locale/zh-CN.ts` | 26KB | 功能正常，拆分收益低 |
| `locale/en-US.ts` | 26KB | 同上 |
| `locale/types.ts` | 20KB | 类型定义，IDE 按需加载无感知 |
| `components/icons/index.tsx` | 12KB | 图标组件，tree-shaking 可优化 |
| `styles/defaultTheme.ts` | 10KB | Token 定义，一次加载 |

这些文件虽然大，但功能正常，IDE 按需加载无感知。拆分收益低于其他项。

---

## 执行优先级

| 优先级 | Phase | 内容 | 预估工时 | 风险 | 状态 |
|--------|-------|------|---------|------|------|
| **P0** | 1 | Reducer + DnD 测试补充 | 1-2 天 | 低 | ✅ Reducer 44 测试通过 |
| **P0** | 2 | Error Boundary 添加 | 0.5 天 | 低 | ✅ 完成（含 resetKeys） |
| **P1** | 3 | `any` 类型清理（adapter 包） | 1-2 天 | 中 | ✅ adapter-antd widgets 已修复，剩余为库互操作 |
| **P1** | 4 | Adapter 重复代码消除 | 0.5 天 | 低 | ✅ 完成 |
| **P1** | 5 | sideEffects 字段补充 | 0.5 小时 | 低 | ✅ 完成 |
| **P2** | 6 | DesignerContext 兼容层清理 | 0.5 天 | 低 | ✅ 完成 |
| **P2** | 7 | Designer useMemo 简化 | 0.5 天 | 中 | ✅ 完成 |
| **P2** | 8 | FormRender props 钻透优化 | 1 天 | 中 | ✅ 已确认无需改动 |
| **P2** | 9 | evalExpr 缓存优化 | 0.5 天 | 低 | ✅ 完成 |
| **P3** | 10 | useFormDesigner 弃用（标记 @deprecated） | 0.5 天 | 低 | ✅ 完成 |
| **P3** | 11 | Debounce 模式统一 | 0.5 天 | 低 | ✅ 已确认无需改动 |
| **P3** | 12 | ContainerPreview 注册表重构 | 1 天 | 中 | ✅ 完成 |
| **P3** | 13 | ID 统一 + type-check 确认 + debounceTimers 清理 | 0.5 小时 | 低 | ✅ 完成 |

---

## 执行原则

1. **每一步改动后必须 `pnpm build` + `pnpm test` + `pnpm lint` 确认无回归**。
2. **保持对外导出接口不变**（`index.ts` 的 exports），确保向后兼容。涉及导出变更的项（如 useFormDesigner）必须走弃用期。
3. **Phase 间可并行**：测试补充（Phase 1）可与代码重构并行进行。
4. **先做高收益低风险**：测试（Phase 1）、Error Boundary（Phase 2）、sideEffects（Phase 5）都是低风险高收益项，建议优先。
5. **每项完成后更新文档**：README、JSDoc、AGENTS.md 等文档需同步更新（各节标注 `Docs: [ ]`）。
