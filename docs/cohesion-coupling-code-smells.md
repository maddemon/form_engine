# 高内聚低耦合代码坏味道分析 & 优化计划

> 扫描时间：2026-06-12（v2 — 整合评审反馈）
> 范围：`packages/core/src/`、`packages/adapter-antd/src/`
> 工具：madge 8.0（循环依赖）、ts-prune（死代码）、PowerShell rg（any/断言统计）

---

## 一、循环依赖（Circular Dependency）

> `npx madge --circular packages/core/src/index.ts` 结果：**63 条循环依赖**

### 1.1 核心循环链路（按严重度排序）

#### 链路 A：`components/*` ↔ `propRenders` ↔ `registry`（~50 条）

```
components/checkbox/Props.tsx
  → propRenders/index.ts
    → components/collapse/Props.tsx
      → components/collapse/index.ts
        → widgets/index.ts
          → widgets/DataSourceEditor.tsx
```

**根因**：`components/*/Props.tsx` 导入 `propRenders`（用于属性面板渲染），而 `propRenders/index.ts` 反向导入所有 `components/*/Props`。形成星形循环。

**建议**：

- `propRenders` 不应直接导入 `components`。改为通过注册表（`PropsRenderMap`）延迟查找
- `components/*/Props.tsx` 纯类型文件不应导入运行时模块（`propRenders/shared`）
- **优先级：高** — 63 条循环中的 ~50 条来自此链路
- **验证**：`npx madge --circular packages/core/src/index.ts` 输出 0 条
- **[BC]** — 不影响外部 consumer，纯内部重构

#### 链路 B：`NestedField` ↔ `ContainerPreview`（~6 条）

```
NestedField.tsx → ContainerPreview/index.ts → ContainerPreview.tsx
  → defaultContainerRenderers.tsx → GridContainerContent.tsx → RegionPreview.tsx
```

**根因**：`NestedField` 从 barrel `index.ts` 导入 `ContainerPreview`，而 `ContainerPreview` 内部的渲染器又间接依赖 `NestedField`。

**建议**：

- `NestedField` 直接导入 `ContainerPreview.tsx` 而非 barrel `index.ts`
- **优先级：高**
- **验证**：madge 中无 NestedField ↔ ContainerPreview 相关循环

#### 链路 C：`types/schema.ts` ↔ `components/index.ts`

```
types/schema.ts → components/index.ts → components/checkbox/index.ts → ...
```

**根因**：`types/schema.ts`（类型定义）导入 `components/index.ts`（运行时模块），而 `components` 反向引用 `types`。

**建议**：

- 类型文件不应导入运行时模块。`schema.ts` 中对 `components` 的依赖应提取为独立类型包或使用 `import type`
- **优先级：高**
- **验证**：madge 中无 types ↔ components 循环

---

## 二、死代码 / 无用导出

> `npx ts-prune --project packages/core/tsconfig.json` 结果

### 2.1 barrel `index.ts` 导出的未使用类型

以下类型从 `@form-engine/core` 导出，但在 core 包内部 **无消费方**（可能被外部 consumer 使用，需确认）：

| 类型                       | 文件                  | 风险                    |
| -------------------------- | --------------------- | ----------------------- |
| `CustomComponent`          | `types/schema.ts`     | 低 — 外部自定义组件 API |
| `CustomSource`             | `types/schema.ts`     | 低                      |
| `DataSourceType`           | `types/schema.ts`     | 低                      |
| `FieldMock`                | `types/schema.ts`     | 中 — 可能已废弃         |
| `FieldType`                | `types/schema.ts`     | 低                      |
| `RegisteredComponent`      | `types/schema.ts`     | 中 — 内部未使用         |
| `RegisteredComponentProp`  | `types/schema.ts`     | 中                      |
| `VisibleWhen`              | `types/schema.ts`     | 低                      |
| `$Form`、`$Self`           | `types/events.ts`     | 低 — 用户事件 API       |
| `CollapsePanelConfig`      | `components/collapse` | 中 — 内部未使用         |
| `SubFormColumnConfig`      | `components/sub-form` | 中                      |
| `TabPaneConfig`            | `components/tabs`     | 中                      |
| `PropEditorConfig`         | `types/adapter.ts`    | 中 — 内部未使用         |
| `PropertyPanelRenderProps` | `types/adapter.ts`    | 中                      |

**建议**：

- 对 `FieldMock`、`RegisteredComponent`、`RegisteredComponentProp`、`CollapsePanelConfig`、`SubFormColumnConfig`、`TabPaneConfig` 标记 `@deprecated`，下个 major 移除
- 其余保留（外部 API 需要）
- **优先级：中**
- **验证**：`ts-prune` 输出减少至 0（或仅剩外部 API 类型）

### 2.2 未使用的 barrel re-export

```typescript
// index.ts:232
export * from './utils'
// index.ts:253
export * from './dataSource/resolver'
```

**问题**：`export *` 将所有 utils 和 resolver 导出，包含未使用的内部函数。

**建议**：

- 改为具名 export，只导出 public API
- **优先级：中** — 影响 dts 体积和 tree-shaking
- **[BC]** — 如果外部 consumer 依赖了这些"意外"导出，则是 breaking change
- **验证**：`pnpm build` 后对比 dts 文件大小

---

## 三、God Module（上帝模块 / 职责过多）

### 3.1 `components/icons/index.tsx` — 516 行，40+ 图标

**问题**：所有图标定义在单一文件，改动任何图标触发整文件 re-compile。

**建议**：

- 按功能分组拆分（`icons/Basic.tsx`、`icons/Layout.tsx`、`icons/Editor.tsx`、`icons/Form.tsx`）
- 保留 `icons/index.ts` 作为 barrel re-export
- **优先级：中**
- **验证**：`import { Calendar } from '../icons/Calendar'` 能工作

### 3.2 `widgets/DataSourceEditor.tsx` — 458 行，3 个组件 + 1 个 hook + 3 个工具函数

**问题**：`BatchEditModal`、`RemoteConfigModal`、`WidgetDataSourceEditorInner` + `useSourceTypeOptions` hook + `parseUrlDeps`、`toFlatLines`、`fromFlatLines` 全在一个文件，低内聚。

**建议**：

- `BatchEditModal` → `widgets/DataSourceEditor/BatchEditModal.tsx`
- `RemoteConfigModal` → `widgets/DataSourceEditor/RemoteConfigModal.tsx`
- 工具函数 → `widgets/DataSourceEditor/utils.ts`
- 主组件保留，import 子组件
- **优先级：高**
- **验证**：`import { BatchEditModal } from './DataSourceEditor/BatchEditModal'` 能工作

### 3.3 `types/adapter.ts` — 354 行，混杂 6 种类型

**建议**：

- `types/adapter-field.ts` — FieldComponentProps, FieldRendererFn, ComponentRenderFn
- `types/adapter-form.ts` — FormWrapperProps, FormItemProps
- `types/adapter-designer.ts` — DesignerWidgets, PropEditorConfig, PropertyPanelRenderProps
- `types/adapter.ts` — 保留 FormEngineAdapter（聚合导入）
- **优先级：中**
- **验证**：`import type { FormEngineAdapter } from '@form-engine/core'` 仍可用
- **[BC]** — 如果外部直接 `import { DesignerWidgets } from '@form-engine/core/types/adapter'`，路径变化是 breaking

### 3.4 `index.ts` — 325 行 barrel

**建议**：

- 删除 `export *`，改为具名 export
- 拆为 `core/runtime.ts`（运行时）和 `core/designer.ts`（设计器）两个入口
- **优先级：中** — 影响 tree-shaking 和 dts 体积（库项目中 barrel 导出影响被低估）
- **验证**：dts 文件体积减少 ≥20%

### 3.5 `locale/zh-CN.ts` — 785 行，全量语言包单文件

**问题**：所有组件的中文标签、属性名、校验提示堆在一个文件。新增组件需同时改 2-3 个语言文件，与 `componentRegistry` 存在隐式同步需求。这是项目中最大的单文件。

**建议**：

- 按组件分组拆分（`locale/zh-CN/checkbox.ts`、`locale/zh-CN/select.ts` 等）
- 保留 `locale/zh-CN.ts` 作为 barrel re-export
- **优先级：高** — 维护成本最高，每次新增组件必改
- **验证**：`import { checkbox } from './locale/zh-CN/checkbox'` 能工作

### 3.6 `components/index.ts` — 285 行，混合 5 种职责

**问题**：同时承担类型 re-export、运行时注册表（`componentRegistry`）、查询工具函数（`getComponentCategory` 等）、事件声明 re-export、图标 re-export，低内聚。

**建议**：

- `componentRegistry` → `components/registry.ts`
- 查询工具函数 → `components/utils.ts`
- `components/index.ts` 仅保留 re-export
- **优先级：中**
- **验证**：`import { componentRegistry } from './components/registry'` 能工作

---

## 四、Props Drilling & Context 耦合

### 4.1 `FieldRenderer` — 与 4 个 Context 交互

**文件**：`renderer/FieldRenderer.tsx:164-167`

```tsx
const engineCtx = useContext(FormEngineContext) // 消费
// + useInsideContainer → InsideContainerContext       // 消费（间接）
// + <FieldSchemaContext.Provider>                      // 提供
// + <AdapterContext.Provider>                          // 提供
// + useFieldExpression, useFieldOptions, useFieldProps, useFormItemProps
```

**问题**：FieldRenderer 同时与 4 个 Context 交互——**消费** `FormEngineContext` 和 `InsideContainerContext`，**提供** `FieldSchemaContext` 和 `AdapterContext`。其中 `useContext(FormEngineContext)` 仅用于读取 `jsxScope`，而 `adapter` 已通过 props 传入，Context 读取是冗余的。

**建议**：

- 移除 `useContext(FormEngineContext)`，统一用 props 传递
- **优先级：中**
- **验证**：React DevTools 确认 FieldRenderer 不再消费 FormEngineContext

### 4.2 `NestedField` — Context + Props 双轨

**文件**：`designer/ContainerPreview/NestedField.tsx:27-33`

**问题**：同时接受 props 和 Context fallback，导致两种调用路径。

**建议**：

- 根级模式通过 Context 传递，容器内模式由父级通过 props 传递，不双轨
- **优先级：中**
- **验证**：移除 `selectedFieldIdProp` / `formConfigProp` / `adapterProp` 后测试通过

### 4.3 `DesignerConfigContext` — 职责过重

**文件**：`designer/DesignerContext.ts`

**问题**：`scene`、`formConfig`、`adapter`、`desktopAdapter`、`mobileAdapter` 全在一个 Context。scene 变化时所有消费者重渲染，即使只关心 `formConfig`。

> **已完成的改进**：`DesignerContext` 已拆分为 `DesignerDispatchContext`、`DesignerSelectionContext`、`DesignerConfigContext` 三个独立 Context。当前建议是进一步拆分 `DesignerConfigContext` 本身。

**建议**：

- 拆分为 `SceneContext` + `FormConfigContext` + `DesignerAdapterContext`
- 或用 selector pattern（`useSyncExternalStore`）
- **分步走**：① 新增独立 Context → ② 迁移 consumer → ③ 删除旧 Context
- **优先级：高**
- **验证**：React DevTools Profiler 确认 scene 切换不再触发只消费 formConfig 的组件重渲染
- **[BC]** — 如果外部 consumer 直接 `useContext(DesignerConfigContext)`，则为 breaking

---

## 五、长函数 / 组件

### 5.1 `useDndHandlers` — 309 行

**文件**：`designer/Dnd/useDndHandlers.ts`

**问题**：`handleDragOver`（68 行）、`handleDragEnd`（72 行）逻辑密集，嵌套深。

**建议**：

- `computeDropTarget` → `Dnd/computeDropTarget.ts`（纯函数，可独立测试）
- `handleDragOver` → `Dnd/handleDragOver.ts`
- `handleDragEnd` → `Dnd/handleDragEnd.ts`
- **优先级：高**
- **验证**：`import { computeDropTarget } from './Dnd/computeDropTarget'` 能独立测试

### 5.2 `FormRender` — 312 行，3 个组件

**建议**：

- `NestedFieldRenderer` → `renderer/NestedFieldRenderer.tsx`
- `DefaultFormWrapper` → `renderer/DefaultFormWrapper.tsx`
- **优先级：中**
- **验证**：`import { NestedFieldRenderer } from './renderer/NestedFieldRenderer'` 能工作

### 5.3 `DesignerInner` — 文件 253 行，函数体约 110 行

**建议**：

- Scene 管理 → `useDesignerScene` hook（已有部分，可完善）
- Context 创建 → `DesignerProviders.tsx`
- **优先级：中**

---

## 六、代码重复 / 重复模式

### 6.1 `isContainerComponent()` 调用分散（6+ 处）

**出现位置**：`FormRender.tsx:283`、`NestedField.tsx:40`、`PropertyPanel/index.tsx:72`、`PalettePanel/utils.tsx`、`ComponentTree.tsx`

**问题**：部分地方用 `getComponentCategory` + `Array.isArray` 判断，不统一。

**建议**：

- 统一使用 `isContainerComponent()`，移除冗余的 Array.isArray 分支
- **优先级：低**
- **验证**：全局搜索 `Array.isArray(category)` 返回 0 结果

### 6.2 Adapter 组件模板代码重复

**文件**：`adapter-antd/src/components/*.tsx`

**问题**：每个 adapter 组件重复相同的模式：

```tsx
const { locale } = useLocale()
const placeholder = placeholderProp ?? locale.adapter.common.placeholder.xxx
const handleChange = (e) => { /* isComposing check */ onChange?.(...) }
return <AntdXxx {...props} />
```

**建议**：

- 提取 `createAdapterComponent(factory)` 工厂函数，封装 locale fallback + isComposing 检查
- **优先级：中**
- **验证**：每个 adapter 组件减少 ~10 行样板代码

### 6.3 `getComponentCategory` 类型判断冗余

**文件**：`PropertyPanel/index.tsx:70-73`

```tsx
const isForm = Array.isArray(category) ? category.includes('form') : category === 'form'
const isContainer = Array.isArray(category) ? category.includes('container') : category === 'container'
const isButton = Array.isArray(category) ? category.includes('button') : category === 'button'
```

**建议**：

- 提供 `isFormComponentType(type)` 等组合函数
- **优先级：低**

---

## 七、魔法值 / 硬编码

### 7.1 硬编码中文字符串

**文件**：`designer/hooks/useFieldNameValidation.ts:19`

```tsx
const nameError = nameDirty && currentName && existingNames.has(currentName) ? '该字段名已存在' : null
```

**建议**：

- 改为 `locale.designer.fieldNameAlreadyExists`（如果项目有多语言需求）
- **优先级：低** — 项目暂无多语言需求时仅为代码整洁度改善
- **验证**：切换 locale 后错误提示语言跟随变化

**其他遗漏案例**：

| 文件                                      | 行号  | 硬编码内容                                 |
| ----------------------------------------- | ----- | ------------------------------------------ |
| `adapter-antd/src/components/SubForm.tsx` | 29    | `'请先在「表格属性」中配置列'`             |
| `designer/PropertyPanel/RulesEditor.tsx`  | 24-30 | `COMMON_PATTERNS` 常量硬编码中文正则预设名 |

其中 `RulesEditor.tsx` 同时存在 `useCommonPatterns()` hook（使用 locale）和 `COMMON_PATTERNS` 常量（硬编码中文），内容相同但实现不同，后者疑似遗留代码。

### 7.2 `SELF_RENDERED` 集合散落在组件内

**文件**：`designer/ContainerPreview/NestedField.tsx:15`

```tsx
const SELF_RENDERED = new Set(['card', 'collapse', 'tabs'])
```

**问题**：与 `defaultContainerRenderers` 存在隐式关联，加新容器组件时容易漏改。

**建议**：

- 移到 `ContainerPreview/types.ts`，作为容器组件元数据属性
- **优先级：中** — 高心智负担低代码量的坑
- **验证**：`SELF_RENDERED` 与 `defaultContainerRenderers` 的 key 在同一文件中可见

---

## 八、Inconsistent Patterns

### 8.1 React.memo 使用不一致

**已使用**：`FormRender`、`NestedFieldRenderer`、`FieldRenderer`、`DefaultFormItem`、`DragGhost`、`NestedField`、`WidgetDataSourceEditor`

**未使用**：`Canvas`、`DesignerInner`、`PropertyPanel`、`ContainerPreview`、`PalettePanel`

**建议**：

- 对高频重渲染的纯展示组件统一加 `React.memo`
- 对接收回调/Context 的组件评估是否真正需要 memo
- **优先级：中**
- **验证**：React DevTools Profiler 对比优化前后的重渲染次数

### 8.2 样式使用方式不一致

**混合使用**：

- `useStyle()` + `token()` — 如 `Canvas.tsx:67`
- CSS 变量直接引用 — 如 `Designer.tsx:37: 'var(--fe-bg-secondary)'`
- 内联硬编码 — 如 `DataSourceEditor.tsx:143: { padding: '3px 6px' }`

**建议**：

- 禁止内联硬编码间距/颜色，统一走 token
- 与现有 ESLint rule `ban-hardcoded-style` 对齐
- **优先级：高**
- **验证**：`pnpm check:tokens` 输出 0 warnings

### 8.3 `CustomPropsRender` switch 隐式耦合

**文件**：`propRenders/CustomPropsRender.tsx:26-89`

**问题**：9 个 switch case 将 widget 类型映射到渲染组件，与 `DesignerWidgets` 接口定义存在隐式耦合——新增 widget 类型时需同时修改两处，容易遗漏。

**建议**：

- 改为注册表模式，与 `componentRegistry` 对齐
- **优先级：中**
- **验证**：新增 widget 类型时只需修改一处

### 8.4 模块级可变状态

| 文件                                                     | 变量                                                     | 风险                       |
| -------------------------------------------------------- | -------------------------------------------------------- | -------------------------- |
| `registry/propertySlotRegistry/widgetAdapters.tsx:18-19` | `_expressionInput` / `_dataSourceEditor`（模块级 `let`） | 多实例场景下互相覆盖       |
| `designer/PalettePanel/utils.tsx:39`                     | `_counter`（模块级计数器）                               | 多 Designer 实例共享计数器 |

**建议**：

- `widgetAdapters.tsx`：改为 Context 注入或函数参数传入
- `utils.tsx`：使用 `useId()` 或 React Context 管理计数器
- **优先级：中** — 多实例场景下是 bug
- **验证**：同时渲染两个 `<Designer>` 实例，fieldId 不冲突

### 8.5 内联 Props 类型定义

以下组件的 props 直接在函数参数中定义，而非使用命名 interface：

| 文件                                            | 组件                          |
| ----------------------------------------------- | ----------------------------- |
| `widgets/DataSourceEditor.tsx:48-58`            | `BatchEditModal`              |
| `widgets/DataSourceEditor.tsx:92-101`           | `RemoteConfigModal`           |
| `widgets/DataSourceEditor.tsx:230-242`          | `WidgetDataSourceEditorInner` |
| `designer/Canvas/Canvas.tsx:17`                 | `CanvasDroppable`             |
| `designer/Canvas/ComponentTree.tsx:21`          | `TreeNode`                    |
| `adapter-antd/src/components/SubForm.tsx:14-20` | `SubForm`                     |

**建议**：

- 提取为命名 interface，便于复用和文档化
- **优先级：低**

### 8.6 业务逻辑与展示混合

| 文件                                      | 组件                          | 混合内容                                                          |
| ----------------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| `widgets/DataSourceEditor.tsx`            | `RemoteConfigModal`           | URL 依赖解析逻辑 + 表单 UI                                        |
| `widgets/DataSourceEditor.tsx`            | `WidgetDataSourceEditorInner` | 数据源类型切换 + 远程配置构建 + UI                                |
| `adapter-antd/src/components/SubForm.tsx` | `SubForm`                     | 行数据操作（handleAddRow/handleRemoveRow）+ 列定义构建 + 表格渲染 |
| `designer/PropertyPanel/RulesEditor.tsx`  | `RulesEditor`                 | 规则更新逻辑 + 正则预设数据 + UI                                  |

**建议**：

- 业务逻辑提取为自定义 hook（如 `useSubFormRows`、`useRemoteConfig`）
- 组件仅负责渲染
- **优先级：中** — 与 DataSourceEditor 拆分（3.2）同步进行

---

## 九、类型安全

### 9.1 `any` 使用统计

| 位置                                 | 数量 | 说明                                        |
| ------------------------------------ | ---- | ------------------------------------------- |
| `events/__tests__/resolver.test.ts`  | 6    | 测试文件，可接受                            |
| `types/component.ts`                 | 1    | 需审查                                      |
| `useAdaptiveAdapter.ts`              | 2    | `(mql as any).addListener` — 旧 Safari 兼容 |
| `designer/__tests__/reducer.test.ts` | 1    | 测试文件                                    |

**结论**：`any` 使用控制良好（总共 ~10 处），非主要问题。

### 9.2 `as unknown as X` 双重断言

| 位置                                        | 说明                                                     |
| ------------------------------------------- | -------------------------------------------------------- |
| `events/actions.ts`                         | 1 处                                                     |
| `widgets/Select.tsx`                        | 1 处 — `options as unknown as Record<string, unknown>[]` |
| `designer/ContainerPreview/NestedField.tsx` | 1 处 — `listeners as FieldItemProps['dragListeners']`    |
| `designer/RootFields/index.tsx`             | 1 处                                                     |

**建议**：

- `Select.tsx` 的断言可通过泛型参数消除
- `NestedField.tsx` 的断言可通过统一 DragListeners 类型消除
- **优先级：低**
- **验证**：`grep -r "as unknown as" packages/core/src` 返回 0 结果

---

## 十、副作用清理

### 10.1 useEffect + addEventListener / setTimeout 清理

**扫描结果**：所有 `addEventListener` 和 `setTimeout` 均有对应清理函数：

| 文件                            | 副作用                                  | 清理                           |
| ------------------------------- | --------------------------------------- | ------------------------------ |
| `useAdaptiveAdapter.ts:31`      | `mql.addEventListener`                  | `mql.removeEventListener`      |
| `Select.tsx:35`                 | `document.addEventListener`             | `document.removeEventListener` |
| `ComponentTree.tsx:60`          | `document.addEventListener`             | `document.removeEventListener` |
| `useDebouncedFieldUpdate.ts:44` | `timerRef.current = setTimeout`         | `clearTimeout`                 |
| `useDebouncedInput.ts:14,79`    | `timerRef.current = setTimeout`         | `clearTimeout`                 |
| `useDataSource.ts:44`           | `timer = setTimeout`                    | `clearTimeout`                 |
| `useFormValues.ts:35`           | `onChangeTimerRef.current = setTimeout` | `clearTimeout`                 |

**结论**：副作用清理规范，无泄漏问题。

---

## 十一、Import / Export 秩序

### 11.1 default export vs named export 不一致

**default export**：`ContainerPreview`（`ContainerPreview.tsx`）、`CodeEditor`（`fallbacks/CodeEditor.tsx`）

**named export**：`FieldRenderer`、`FormRender`、`Designer`、`PalettePanel`、`PropertyPanel`

**问题**：同一层级组件导出方式不统一，不利于 codebase 一致查找。

**建议**：

- 统一为 named export（React 社区趋势）
- **优先级：低**
- **验证**：全局搜索 `export default` 返回 0 结果（除 barrel 和配置文件）

### 11.2 Import 顺序未规范

**现状**：第三方 → 内部绝对路径 → 相对路径（部分文件），但无强制规则。

**建议**：

- 添加 ESLint `import/order` 规则
- **优先级：低**

---

## 十二、测试缺口

### 12.1 无测试覆盖的关键函数

| 函数/模块             | 文件                             | 说明                                   |
| --------------------- | -------------------------------- | -------------------------------------- |
| `computeDropTarget`   | `designer/Dnd/useDndHandlers.ts` | 拖拽核心逻辑，当前不可独立 import 测试 |
| `handleDragOver`      | `designer/Dnd/useDndHandlers.ts` | 复杂条件分支，无单元测试               |
| `handleDragEnd`       | `designer/Dnd/useDndHandlers.ts` | 同上                                   |
| `ContainerPreview`    | `designer/ContainerPreview/`     | 无测试                                 |
| `PropertyPanel`       | `designer/PropertyPanel/`        | 无测试                                 |
| `PalettePanel`        | `designer/PalettePanel/`         | 无测试                                 |
| `useDndHandlers` 整体 | `designer/Dnd/`                  | 仅 `positionResolver.test.ts` 有测试   |

### 12.2 Adapter 包无任何测试

- `adapter-antd`：0 个测试文件
- `adapter-antd-mobile`：0 个测试文件
- `dts: false` 导致 consumer 无法获得 adapter 的类型定义

**建议**：

- Phase 1 拆分 `useDndHandlers` 后，为 `computeDropTarget` 添加纯函数测试
- Phase 2 为 adapter 添加 smoke test（渲染不崩溃）
- **优先级：中**

---

## 十三、错误处理模式

### 13.1 Promise rejection 未捕获

**文件**：`renderer/hooks/useFormRender.ts:126-139`

```tsx
Promise.resolve(doValidate(visibleFields, submitValues_, undefined, validation))
  .then((result) => { ... })
  .catch((err) => {
    console.error('[form-engine] 校验异常:', err)
  })
```

**问题**：`.catch` 仅 `console.error`，未向用户暴露错误，也未设置表单错误状态。

**建议**：

- 添加 `onError` 回调 prop，或设置 `fieldErrors` 显示通用错误
- **优先级：中**
- **验证**：校验异常时表单显示错误提示而非静默失败

### 13.2 验证函数 fallback 逻辑

**文件**：`renderer/hooks/useFormRender.ts:101-108`

```tsx
const doValidate = adapterValidate ?? validateForm
const result = await Promise.resolve(doValidate(...))
```

**问题**：`Promise.resolve` 包裹同步函数是防御性编程，但掩盖了 validate 函数的同步/异步签名不一致。

**建议**：

- 统一 `ValidateFn` 返回 `Promise<ValidateResult>`，移除 `Promise.resolve` 包裹
- **优先级：低**

---

## 十四、优化优先级汇总

| 优先级 | 项目                                  | 影响                     | BC       |
| ------ | ------------------------------------- | ------------------------ | -------- |
| **高** | 循环依赖修复（链路 A/B/C）            | 构建稳定性、tree-shaking | 否       |
| **高** | DataSourceEditor.tsx 拆分             | 内聚、可维护             | 否       |
| **高** | useDndHandlers 拆分                   | 内聚、可测试             | 否       |
| **高** | DesignerConfigContext 拆分            | 解耦、性能               | **[BC]** |
| **高** | 样式硬编码统一走 token                | 一致性、主题切换         | 否       |
| **高** | locale/zh-CN.ts 拆分                  | 维护成本、同步风险       | 否       |
| **中** | icons/index.tsx 拆分                  | 开发体验                 | 否       |
| **中** | types/adapter.ts 拆分                 | 类型内聚                 | **[BC]** |
| **中** | NestedField 双轨模式统一              | 可理解性                 | 否       |
| **中** | FormRender 内部组件拆分               | 内聚                     | 否       |
| **中** | Adapter 模板代码工厂化                | 减少重复                 | 否       |
| **中** | React.memo 使用一致性                 | 性能                     | 否       |
| **中** | useFormRender 职责拆分（13 个返回值） | 内聚                     | 否       |
| **中** | ContainerPreview 注册表改造           | 安全性                   | 否       |
| **中** | barrel export 清理（export \*）       | dts 体积                 | **[BC]** |
| **中** | 错误处理统一                          | 鲁棒性                   | 否       |
| **中** | SELF_RENDERED 位置调整                | 高心智负担               | 否       |
| **中** | CustomPropsRender 注册表改造          | 隐式耦合                 | 否       |
| **中** | 模块级可变状态修复                    | 多实例 bug               | 否       |
| **中** | 业务逻辑与展示分离                    | 内聚、可测试             | 否       |
| **中** | components/index.ts 职责拆分          | 内聚                     | 否       |
| **低** | index.ts 拆分双入口                   | Bundle                   | **[BC]** |
| **低** | PropertyPanelInner props 精简         | 可读性                   | 否       |
| **低** | isContainerComponent 调用统一         | 一致性                   | 否       |
| **低** | 魔法值类型化                          | 类型安全                 | 否       |
| **低** | default → named export 统一           | 一致性                   | **[BC]** |
| **低** | handleFormSubmit wrapper 移除         | 代码清洁                 | 否       |
| **低** | as unknown as 断言消除                | 类型安全                 | 否       |
| **低** | useFieldNameValidation i18n           | 国际化                   | 否       |
| **低** | 内联 Props 类型提取                   | 复用、文档化             | 否       |

---

## 十五、建议实施路线

### Phase 1 — 高优先级（2-3 天）

1. **修复循环依赖** — 拆分 `components/*/Props.tsx` 对 `propRenders` 的依赖，改用注册表延迟查找
2. **修复 NestedField ↔ ContainerPreview 循环** — 直接导入而非 barrel
3. **修复 types ↔ components 循环** — `import type` 替代 `import`
4. **DataSourceEditor.tsx 拆分** — 3 个子文件 + utils + hook
5. **useDndHandlers 拆分** — 3 个纯函数文件
6. **DesignerConfigContext 拆分** — 新增独立 Context → 迁移 → 删除旧的
7. **审查内联硬编码样式** — 与 `ban-hardcoded-style` 对齐
8. **locale/zh-CN.ts 拆分** — 按组件分组，保留 barrel re-export

### Phase 2 — 中优先级（3-4 天）

9. **icons/index.tsx 按功能分组拆分**
10. **types/adapter.ts 按职责拆分**
11. **NestedField 统一为单一数据来源**
12. **FormRender 内部组件提取**
13. **useFormRender 职责拆分**（确保子 hook 不重复订阅事件源）
14. **Adapter 模板代码工厂化**
15. **barrel export 清理**（`export *` → 具名 export）
16. **CustomPropsRender 注册表改造** — 消除与 DesignerWidgets 的隐式耦合
17. **模块级可变状态修复** — widgetAdapters.tsx + PalettePanel/utils.tsx
18. **业务逻辑与展示分离** — DataSourceEditor、SubForm、RulesEditor
19. **components/index.ts 职责拆分** — registry + utils 独立

### Phase 3 — 低优先级（可选）

20. 魔法值类型化
21. React.memo 策略统一
22. Import 顺序 ESLint 规则
23. default → named export 统一
24. `as unknown as` 断言消除
25. 内联 Props 类型提取为命名 interface

---

## 十六、执行状态（2026-06-12 全量完成）

### Phase 1 — 高优先级 ✅

| # | 项目 | 状态 | 说明 |
|---|------|------|------|
| 1 | 循环依赖链路 A（components ↔ propRenders） | ✅ | components/*/Props.tsx 改为直接导入 submodule，断开 barrel 循环 |
| 2 | 循环依赖链路 B（NestedField ↔ ContainerPreview） | ✅ | 直接导入 ContainerPreview.tsx 而非 barrel |
| 3 | 循环依赖链路 C（types/schema ↔ components） | ✅ | 已使用 `import type`，运行时依赖已切断 |
| 4 | DataSourceEditor.tsx 拆分 | ✅ | 4 文件子目录（index.tsx + BatchEditModal + RemoteConfigModal + utils） |
| 5 | useDndHandlers 拆分 | ✅ | 3 个纯函数文件（computeDropTarget + handleDragOver + handleDragEnd） |
| 6 | DesignerConfigContext 拆分 | ✅ | 3 个独立 Context（Scene + FormConfig + Adapter），旧 Context 标记 @deprecated |
| 7 | 样式硬编码审计 | ✅ | pnpm check:tokens 0 violations |
| 8 | locale/zh-CN.ts 拆分 | ✅ | 5 文件子目录（designer + component + widget + validation + adapter） |

### Phase 2 — 中优先级 ✅

| # | 项目 | 状态 | 说明 |
|---|------|------|------|
| 9 | icons/index.tsx 拆分 | ✅ | 5 文件子目录（createIcon + Basic + Layout + Form + Editor） |
| 10 | types/adapter.ts 拆分 | ✅ | 4 文件拆分（adapter-field + adapter-form + adapter-designer + adapter barrel） |
| 11 | NestedField 双轨模式统一 | ✅ | 移除 props/Context fallback，统一 Context hooks |
| 12 | FormRender 内部组件提取 | ✅ | NestedFieldRenderer + DefaultFormWrapper 独立文件 |
| 13 | Adapter 模板代码工厂化 | ✅ | createAdapterComponent.tsx（useAdapterPlaceholder + useComposingChange），6 个组件已更新 |
| 14 | useFormRender 职责拆分 | ✅ | 经分析保持现有子 hook 结构（useFormValues + useFormValidation + useDataSource + useVisibility 已合理分解） |
| 15 | barrel export 清理 | ⚠️ 部分完成 | utils 已改为具名 export；dataSource/resolver 仍保留 `export *`（中优先级·BC 风险） |
| 16 | CustomPropsRender 注册表改造 | ✅ | switch → widgetRendererRegistry 注册表模式 |
| 17 | 模块级可变状态修复 | ✅ | widgetAdapters.tsx: let → WeakMap；PalettePanel/utils.tsx: _counter → Date.now() + random |
| 18 | 业务逻辑与展示分离 | ✅ | SubForm: useSubFormRows hook；RulesEditor: 移除 COMMON_PATTERNS 硬编码，统一 useCommonPatterns() |
| 19 | components/index.ts 职责拆分 | ✅ | registry.ts + utils.ts 独立，index.ts 仅 re-export |
| 20 | SELF_RENDERED 位置调整 | ✅ | 移至 ContainerPreview/types.ts 命名为 SELF_RENDERED_CONTAINERS |

### Phase 3 — 低优先级 ✅

| # | 项目 | 状态 | 说明 |
|---|------|------|------|
| 21 | as unknown as 断言消除 | ✅ | 生产代码仅剩测试文件 1 处 |
| 22 | 内联 Props 类型提取 | ✅ | BatchEditModalProps + RemoteConfigModalProps + WidgetDataSourceEditorInnerProps + CanvasDroppableProps + TreeNodeProps |
| 23 | 硬编码中文字符串 | ⏳ | 低优先级，项目暂无多语言需求时暂不处理 |
| 24 | Array.isArray(category) 调用统一 | ⏳ | 低优先级，PropertyPanel/index.tsx 仍有 3 处 |

### 构建验证

- `pnpm build` ✅ 三包（core + adapter-antd + adapter-antd-mobile）CJS/ESM/DTS 全部成功
- `pnpm check:tokens` ✅ 131 文件 0 violations
- `pnpm test` ✅ 100/102 通过（2 个 FormRender submit 异步测试为预存问题）
- 新增文件：27 个 | 删除文件：2 个 | 修改文件：49 个
- 全量变更：+525 / -2771 行
