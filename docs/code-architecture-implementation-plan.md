# 架构优化实施方案

> 基于 `code-architecture-review.md` 中的问题清单，按依赖关系和风险等级分 7 个阶段推进。
>
> 日期：2026-06-04 | 最后状态复核：2026-06-05
>
> **状态标记：** ✅ 已完成 | 🟡 部分完成 | ⬜ 待处理

---

## 总体原则

1. **每个阶段独立可交付**：一个阶段完成后项目应可正常编译运行，不依赖后续阶段。
2. **先基础设施后上层**：类型系统、注册机制等基础变更优先，它们是后续重构的前提。
3. **每个阶段内按风险从低到高排序**：先做低风险的清理，再做结构性拆分。
4. **每步改完即编译验证**，不积压错误。

## 测试保障策略

> 大规模重构无测试覆盖时难以判断是否引入 regression。每个阶段实施前必须先补足该阶段涉及模块的核心测试。

- **每个阶段开头补充测试**：在动手改代码前，先为该阶段涉及的核心模块补充单元测试和/或集成测试。
- **测试范围建议**：
  - 阶段一（类型）：无额外测试，编译验证即可。
  - 阶段二（注册）：补充 `FieldType` 推导、`isValidFieldType` 动态判断、`getComponentCategory` 查表等工具函数单测。
  - 阶段三（Context）：补充 consumer 重渲次数断言（可用 `@testing-library/react` + `jest` mock render count）。
  - 阶段四（拆分）：补充每个提取出的独立模块的单元测试。
  - 阶段五、六、七：同阶段四，每次提取/改动后加测试。
- **验收标准**：`pnpm test` 全部通过，核心模块覆盖率不低于重构前。

## 架构原则

> 以下原则是整个重构方案的基础假设，各阶段实施时应始终遵守。

### Adapter 接管一切，开发者零映射

当前暴露给开发者的概念太多：组件映射、主题映射、图标映射……开发者头都大了。

**核心思路**：开发者只需要"选 adapter"，框架自动从 adapter 中读取所需的所有映射关系。

```
开发者视角：             框架内部：
选 adapter ──→ adapter 内包含：
                  ├─ components（组件映射）
                  ├─ iconMap  （图标映射）
                  ├─ themeConfig（主题配置 → 自动注入 Token）
                  └─ useThemeBridge（自动同步 UI 库 Token）
```

三个映射全部藏在 adapter 内部，对开发者不可见。这意味着 adapter 定义就是一个"自包含包"，包含运行所需的一切。

### 落实到具体

**Icon**：`registry.icon` 只存字符串标识，adapter 的 `iconMap` 负责渲染为实际图标组件。

```ts
// registry — 纯数据
export interface ComponentRegistration {
  icon: string
  // ...
}

// adapter — 运行时映射
const iconMap: Record<string, ReactNode> = {
  input: <InputOutlined />,
  card: <AppstoreOutlined />,
  // 自定义组件无匹配 → fallback <FileOutlined />
}
```

Palette 图标渲染处通过 `adapter.iconMap[registry[type].icon]` 获取图标，不直接引用任何 `ReactNode`。

**Theme**：adapter 内部自动同步 UI 库 Token 到 `var(--fe-*)`，开发者不需要手动包裹 `StyleProvider`。

两个都是同一原则的体现：**开发者选的不是 UI 库，选的是 adapter；adapter 负责一切映射。**

---

## 阶段一：类型系统基础修复

> 目标：消除 `FieldComponentProps` 索引签名失明，清理冗余断言，为后续 adapter `as any` 清除铺路。

### 1.1 修复 `FieldComponentProps` 索引签名（对应 6.5、6.2） ✅

- **位置**：`packages/core/src/types/adapter.ts:20-35`
- **问题**：`[key: string]: any` 使所有已知 prop 的类型检查失效，adapter 组件被迫批量 `as any`。
- **现状**：已移除 `[key: string]: any`，改为 13 个显式属性（`value`, `onChange`, `disabled`, `fieldSchema`, `options`, `rules`, `validateStatus`, `help` 等）。
- **方案**：
  - 将 `FieldComponentProps` 改为显式列出所有已知属性（`value`, `onChange`, `disabled`, `options`, `fieldSchema`, `loading` 等），移除索引签名。
  - 未知扩展属性改用泛型参数或 `Record<string, unknown>` 的精确子类型，保留扩展能力但不让已知属性失明。
  - 同步更新 adapter-antd-mobile 中 5 个组件、8 处 `(fieldSchema.componentProps as any)?.xxx`，改为直接访问已类型化的属性。
- **验证**：编译通过 + adapter 组件内无 `as any` 访问 `componentProps` 的模式。

### 1.2 清理冗余类型断言（对应 6.3） ✅

- **位置**：`packages/core/src/renderer/FieldRenderer.tsx`
- **现状**：`FieldRenderer.tsx` 内已无 `as any` 或冗余断言。但 `useAdaptiveAdapter.ts:34,42` 仍有 2 处 `as any`（Safari 旧版降级），无类型安全替代方案时可标注 `eslint-disable`。
- **方案**：已清理。遗留的 2 处 `as any` 在降级代码中，可保留并加 `eslint-disable` 注释。
- **验证**：编译通过。

### 1.3 事件系统类型初步收紧（对应 6.4） 🟡

- **问题**：`ResolvedEventHandler = (...args: any[]) => any`，所有类型信息丢失。
- **状态**：`ResolvedEventHandler` 已改为 `(...args: unknown[]) => unknown`（`any`→`unknown`），`EventCallbacks` 同步改进。但仍未引入泛型 `EventHandler<TArgs, TReturn>`，因现有 `EventHandler` 接口是配置对象类型（与方案中泛型函数类型重名冲突），引入新泛型会造成命名混淆。当前 `unknown` 级别的改进已覆盖主要风险，`any→unknown` 为关键收益。

---

## 阶段二：组件注册统一

> 目标：新增一个组件只需改 1-2 个文件，消除 7 文件同步问题。提取 adapter 共享代码。

### 2.1 Registry 对象驱动（对应 1.1、1.2） ✅

- **位置**：`packages/core/src/components/index.ts`、`packages/core/src/types/schema.ts:95-128`
- **问题**：`FieldType` 为手写联合类型，组件信息分散在多处，增删组件需改 10+ 个文件。
- **现状**：`componentRegistry` 已实现，27 个内置组件全部注册。`FieldType = keyof typeof componentRegistry | 'custom' | 'custom:${string}'`。`EVENT_DECLARATION_MAP`、`getComponentCategory`、`getComponentLabel`、`getComponentIconName`、`getComponentDefaultProps`、`getFormFieldTypes`、`getContainerFieldTypes`、`ALL_FIELD_TYPES` 等全部从 registry 派生。
- **方案**（基于 `component-registration-refactor.md` 方案一，修正版）：

  在 `packages/core/src/components/index.ts` 中维护一个 `componentRegistry` 对象，聚合组件全部元信息：

  ```ts
  export interface ComponentRegistration {
    label: string
    category: ComponentCategory
    icon: string     // 纯标识字符串，adapter 通过 iconMap 映射为实际图标
    defaultProps?: Partial<FormFieldSchema>
    PropsRender: ComponentType<PropsRenderProps>
    eventDeclarations: EventDeclaration[]
  }

  export const componentRegistry = {
    input: {
      label: '输入框',
      category: 'form',
      icon: 'input',
      defaultProps: { /* ... */ },
      PropsRender: InputPropsRender,
      eventDeclarations: inputEventDeclarations,
    },
    select: { /* ... */ },
    // ...
  } as const satisfies Record<string, ComponentRegistration>
  ```

  **关于 `FieldType` 的处理**：不能直接改为 `keyof typeof componentRegistry`，因为当前 `FieldType` 包含 `| 'custom' | 'custom:${string}'` 动态类型。正确做法是保留扩展能力：
  ```ts
  export type FieldType = keyof typeof componentRegistry | 'custom' | `custom:${string}`
  ```
  这样 registry 只管理内置组件，custom 类型保持运行时动态注册。

- **消费方改造**：

  | 消费方 | 来源 |
  |--------|------|
  | `FieldType` 联合类型 | `keyof typeof componentRegistry \| 'custom' \| \`custom:\${string}\`` |
  | `componentPalettes` | 从 registry 映射 `.icon` + `.defaultProps` |
  | `PropsRenderMap` | 从 registry 引用 `.PropsRender` |
  | 事件声明查询表 | `.eventDeclarations` |
  | 组件分组（paletteData） | 按 `.category` 自动分组 |
  | `ALL_FIELD_TYPES` | `Object.keys(registry)` |

- **迁移步骤**：
  1. 定义 `ComponentRegistration` 接口和辅助函数。
  2. 逐个组件迁移到 registry（`palette.tsx` 中的原 `icon: <Svg />` 改为 `icon: 'type-name'` 字符串；各 adapter 新增 `iconMap` 处理图标渲染；`palette.tsx` 文件可删除，元信息全部合入 registry）。
  3. 将 `componentPalettes`、`PropsRenderMap`、`EVENT_DECLARATION_MAP` 改为从 registry 自动生成。
  4. 将 `FieldType` 改为 `keyof typeof componentRegistry | 'custom' | 'custom:${string}'`。
  5. 将 `isValidFieldType` 白名单改为动态判断（`Object.keys(registry).includes(type) || type.startsWith('custom:')`）。
  6. `getComponentCategory` 改为查表（`registry[type]?.category`）。
- **验证**：编译通过 + 新增一个组件只需改 1-2 个文件。

### 2.2 提取 adapter 共享代码（对应 1.3） 🔽 低优先级

- **位置**：`packages/adapter-antd/src/index.tsx:85-89`、`packages/adapter-antd-mobile/src/index.tsx:54-58`
- **问题**：`DefaultField` 在两个 adapter 中完全重复（同样的 `label || name || type` 回退逻辑）。
- **现状**：各约 5 行内联实现，纯 UI 回退逻辑，无状态无逻辑。
- **评估**：ROI 较低——提取到共享包增加一层依赖关系（需要新建 `adapter-shared` 包或改 core 导出），而重复代码量极小。建议作为可选优化，不放入主计划。
- **方案**（如仍要做）：在 `packages/core/src/` 下导出公用函数，两个 adapter 复用。
- **验证**：编译通过 + 两个 adapter 行为不变。

### 2.3 清理 `designer/widgets.tsx` 重导出（对应 4.3） ✅

- **现状**：`designer/widgets.tsx` 已不存在。`designer/` 中的导入已改为 `from '../widgets'`，直接引用 `packages/core/src/widgets/` 目录（含 14 个文件：`index.ts`、`Input.tsx`、`Select.tsx` 等）。
- **方案**：已完成。

---

## 阶段三：Context 拆分与渲染性能

> 目标：消除 DesignerContext 单体引发的级联重渲，为关键组件加 memo，稳定关键引用。

### 3.1 拆分 `DesignerContext`（对应 3.2、3.5） ✅

- **位置**：`packages/core/src/designer/DesignerContext.ts`
- **问题**：7 个值合在一个 Context，任何变化触发所有 consumer 重渲。
- **现状**：已拆分为 `DesignerDispatchContext`（dispatch）、`DesignerSelectionContext`（selectedFieldId + onSelectField）、`DesignerConfigContext`（scene + formConfig + adapter + desktopAdapter）。保留 `useDesignerContext()` 兼容层。消费点已迁移到 `useDesignerDispatch()` / `useDesignerSelection()` / `useDesignerConfig()`。
- **前置步骤**：先普查 `useDesignerContext()` 的所有消费点，列出每个 consumer 使用了哪些字段，确保拆分后的 Context 分配正确。当前消费方包括：`Designer.tsx`、`Canvas.tsx`、`CanvasToolbar.tsx`、`NestedField.tsx`、`FieldList.tsx`、`PropertyPanel.tsx`、`FormConfigPanel.tsx`。
- **方案**：
  - 拆为 3 个 Context：
    - `DesignerDispatchContext`：仅含 `dispatch`（几乎不变）。
    - `DesignerSelectionContext`：含 `selectedFieldId` + `onSelectField`（用户交互时变）。
    - `DesignerConfigContext`：含 `scene`、`formConfig`、`adapter`、`desktopAdapter`（配置级，极少变）。
  - `canvasAdapter` 选择逻辑用 `useMemo` 包裹，依赖 `[scene, desktopAdapter, mobileAdapter]`，避免每次渲染创建新引用。
  - 各 consumer 按需订阅，例如 `FieldItem` 只需 `DesignerDispatchContext` + `DesignerSelectionContext`。
- **验证**：编译通过 + 修改 `scene` 不再触发 `PropertyPanel` 重渲（可用 React DevTools 验证）。

### 3.2 关键组件添加 `React.memo`（对应 3.1） 🟡

- **问题**：5 个高频渲染组件缺少 memo。
- **状态**：`CanvasToolbar`、`NestedField`、`ContainerPreview` 子组件（`GenericContainerContent` 等）已有 `React.memo`。`FieldRenderer` 已包裹 `React.memo`。但 `PropertyPanelInner`、`DefaultPropertyContent`、`FormConfigPanel` 仍无 `React.memo`。这些组件在 Context 拆分后重渲影响已降低（dispatch 变化不再触发无关组件），性能敏感时可后续补充。

### 3.3 稳定 `NestedFieldRenderer` 的共享 props（对应 3.3） ✅

- **现状**：`NestedFieldRenderer` 已重构为 `FormRender.tsx` 内部的本地组件，使用拆分的 Context（`useFormEngine()`、`useFormState()`、`useFormConfig()`），而非全量 props 传递。渲染器 Context 已拆分为三个独立 Context，不再有单体 Context 问题。
- **方案**：已完成。

### 3.4 稳定 `eventContext` 引用（对应 1.8） ✅

- **现状**：`useFormRender` hook（`packages/core/src/renderer/hooks/useFormRender.ts`）已使用 `useMemo` / `useCallback` 管理上下文引用。事件处理通过拆分的 Context + 子 hook（`useFormValues`、`useFormValidation`、`useDataSource`、`useVisibility`）管理，不再有单体引用导致所有字段重算的问题。
- **方案**：已完成。

### 3.5 `ContainerPreview.tsx` 的 `.filter()` 缓存（对应 3.6） ✅

- **位置**：`packages/core/src/designer/ContainerPreview.tsx`
- **问题**：每次渲染对 `field.children` 做 `.filter()` 创建新数组。
- **方案**：`GridContainerContent` 和 `TableContainerContent` 改用 `useMemo` 预计算 `childrenByColumn` 映射表，`O(1)` 查表替代反复 `O(n)` filter。
- **验证**：编译通过。

---

## 阶段四：单一职责拆分

> 目标：将 PropertyPanel、Designer 等大文件按职责拆分，每个模块职责单一、可独立测试。

### 4.1 拆分 `PropertyPanel.tsx`（对应 2.1） 🟡

- **位置**：`packages/core/src/designer/PropertyPanel.tsx`
- **问题**：349 行做 8+ 件事，防抖方式不一致。
- **现状**：主文件已降至 126 行。已提取 `DefaultPropertyContent.tsx`、`PropertyPanelTabs.tsx`、`EventEditor.tsx`。防抖已统一为 `useDebouncedInput`。字段名校验已提取为 `useFieldNameValidation` hook。但 `componentProps` 的防抖仍使用手动 `setTimeout` 管理（未改用 `useDebouncedInput`，因为 `componentProps` 是多键值对的增量更新，模式不同）。

### 4.2 拆分 `Designer.tsx`（对应 2.2、1.4） 🟡

- **位置**：`packages/core/src/designer/Designer.tsx`
- **问题**：460 行做 5+ 件事，sourcePos 逻辑重复 6 次。
- **现状**：主文件已降至 148 行。已提取 `Dnd/positionResolver.ts`、`Dnd/useDndHandlers.ts`、`useDesignerSync.ts`。`Designer.tsx` 主要保留 Context Provider 组装和顶层 JSX。

### 4.3 提取表达式计算逻辑（对应 2.3、3.4） ✅

- **位置**：`packages/core/src/utils/index.ts:30-40`（`evalExpr` 函数）、`packages/core/src/renderer/hooks/useFieldExpression.ts`
- **问题**：`evalExpr` 在渲染路径中每次执行 `new Function`，不可缓存不可测试。
- **现状**：`useFieldExpression` hook 已提取，`FieldRenderer.tsx` 已改用该 hook。内部通过 `useMemo` 缓存，仅表达式字符串或依赖值变化时重算。
- **方案**：
  - 新建 `renderer/hooks/useFieldExpression.ts`：
    - 接收 `field` + `formValues`，返回 `{ isDisabled, isRequired, isHidden }`。
    - 内部用 `useMemo` 缓存，仅当表达式字符串或依赖值变化时重算。
    - `evalExpr` 调用移出渲染函数，集中在 hook 内。
  - `FieldRenderer.tsx` 改为调用该 hook，移除内联 `evalExpr`。
- **验证**：编译通过 + 表达式相同 + 值不变时不重算。

### 4.4 `ContainerPreview` 注册表模式（对应 2.4、1.6） ✅

- **位置**：`packages/core/src/designer/ContainerPreview.tsx`
- **问题**：if/else 链分发 7 种容器类型（card、grid、table、collapse、tabs、flex、generic），不满足开闭原则；5 处样式重复。
- **现状**：已改用 `containerRendererRegistry: Record<string, React.FC>` 注册表模式，`ContainerPreview` 通过查表分发。新增容器类型只需新增一个 renderer 并注册到 registry。
- **方案**：
  - 定义 `ContainerRenderer` 接口：`{ match: (type: string) => boolean, render: (field, props) => ReactNode }`。
  - 各容器类型各自实现该接口，注册到 `containerRendererRegistry`。
  - `ContainerPreview` 改为查表调用：`containerRendererRegistry.get(field.type)?.render(field, props)`。
  - 提取 droppable 区域样式为 `useDroppableRegionStyle(isOver, hasChildren)` hook，消除 5 处样式重复。
- **验证**：编译通过 + 新增容器类型只需新增一个 renderer 并注册。

### 4.5 `designerReducer` 按领域拆分（对应 2.5） ✅

- **位置**：`packages/core/src/designer/reducer.ts`
- **问题**：312 行处理 8 个 action，复制/移动逻辑耦合。
- **现状**：已将 `insertAfter`、`cloneField`、`cloneFields`、`removeFieldById`、`removeFieldFromTree`、`insertIntoTree`、`updateFieldInTree` 提取为 `reducer/fieldOperations.ts`。reducer 按 action handler 分组（`handleMoveField`、`handleCopyField`、`handleAddField`、`handleUpdateField` 等），主函数为路由分发。
- **方案**：
  - 将 `insertAfter`、`cloneField`、`cloneFields` 提取为 `reducer/fieldOperations.ts`，独立测试。
  - reducer 按 action 语义分组，每组一个处理函数：
    - `handleMoveField(state, action)` — 移动相关
    - `handleCopyField(state, action)` — 复制相关
    - `handleAddField(state, action)` — 新增相关
    - `handleUpdateField(state, action)` — 更新相关
    - `handleDeleteField(state, action)` — 删除相关
    - ...其余 action
  - 主 reducer 变为路由分发。
- **验证**：编译通过 + 每个 handler 可独立单测。

---

## 阶段五：代码去重与清理

> 目标：消除零散的代码重复，统一模式。

### 5.1 `CanvasToolbar.tsx` 按钮抽象（对应 1.5） ✅

- **位置**：`packages/core/src/designer/CanvasToolbar.tsx`
- **问题**：4 个按钮（组件树、撤销、重做、场景切换）JSX 结构相似，`<button>` 样式重复。
- **现状**：已提取 `ToolbarButton` 组件，接收 `label`、`icon`、`disabled`、`onClick`、`active`。`CanvasToolbar` 也包裹了 `React.memo`。
- **方案**：提取 `ToolbarButton` 组件，接收 `label`、`icon`、`disabled`、`onClick`。
- **验证**：编译通过。

### 5.2 `collectFieldNames` 调用优化（对应 1.7） 🔽 低优先级

- **位置**：`packages/core/src/designer/reducer.ts:140`，仅在 `PropertyPanel.tsx` 中使用
- **问题**：`useMemo` 依赖 `allFields`，引用变化即重算全部字段名。
- **评估**：`collectFieldNames` 只用于 `PropertyPanel.tsx` 中校验字段名是否重复，不在渲染热路径上（仅在选中字段时触发），优化收益极小。改为低优先级，等有性能问题时再做也不迟。
- **方案**（如需做）：
  - 改为依赖 `allFields.length` + `allFields.map(f => f.name).join(',')` 的稳定序列化值。
  - 或在 reducer 层面维护 `fieldNamesSet`。
- **验证**：编译通过 + 字段内容不变时 `existingNames` 不重算。

### 5.3 移动 `useAdaptiveAdapter.ts`（对应 4.2） ✅

- **位置**：`packages/core/src/renderer/useAdaptiveAdapter.ts`
- **现状**：已位于 `renderer/` 下。原计划移至 `utils/`，但当前语义合理（仅渲染器路径使用），无需移动。
- **方案**：已完成，保留当前位置。

---

## 阶段六：耦合解耦

> 目标：消除 Designer 对 Renderer 的运行时依赖，提升 Context Provider 层级。

### 6.1 Designer-Renderer 解耦（对应 4.1） 🔽 低优先级

- **位置**：`packages/core/src/designer/NestedField.tsx:4`
- **问题**：`NestedField.tsx` 直接导入 `FieldRenderer` 并传 mock 值（`value={undefined}`、`onChange={() => {}}`、`options={[]}`）。
- **评估**：当前 NestedField 对 FieldRenderer 的调用只传 mock 值，没有实际数据绑定，不存在数据流耦合问题。引入 `fieldPreviewRenderer` 回调虽然消除了 `designer/ → renderer/` 的 import 路径，但增加了 Context 的复杂度且收益有限。建议降级为低优先级，或待其他重构完成后再评估必要性。
- **方案**（如仍要做）：
  - 在 `DesignerContext` 或新 Context 中提供 `fieldPreviewRenderer: (field: FormFieldSchema) => ReactNode` 回调。
  - `NestedField.tsx` 改为调用该回调，不再直接 import `FieldRenderer`。
  - 回调的实现在 Designer 组件上层注入（由使用方决定如何预览字段）。
- **验证**：编译通过 + `designer/` 目录无 `import ... from '../renderer/'` 的引用。

### 6.2 提升 `FieldSchemaContext` / `AdapterContext` Provider 层级（对应 4.5） ✅

- **现状**：渲染器 Context 已拆分为 `FormEngineContext`、`FormStateContext`、`FormConfigContext`，Provider 提升到顶层，容器组件通过 `useFormEngine()` / `useFormState()` / `useFormConfig()` 直接消费。
- **方案**：已完成。

### 6.3 `FormRender.tsx` 状态提取（对应 4.4） ✅

- **位置**：`packages/core/src/renderer/FormRender.tsx`
- **现状**：已从 `./hooks/useFormRender` 导入 `useFormRender`（111 行），内部使用 `useFormValues`、`useFormValidation`、`useDataSource`、`useVisibility` 等子 hook。`FormRender` 主组件仅负责组装 Context Provider + 递归渲染。
- **方案**：已完成。

### 6.4 Adapter 主题自动映射 ✅

- **问题**：当前消费者需要手动包裹 `StyleProvider` + `AntdBridgeProvider` 才能让主题生效，违反了"Adapter 接管一切"原则。

  ```tsx
  // ❌ 之前：三层包裹
  <StyleProvider themeMode={themeMode}>
    <ConfigProvider theme={{ algorithm }}>
      <AntdBridgeProvider>
        <Designer adapter={antdAdapter} />
      </AntdBridgeProvider>
    </ConfigProvider>
  </StyleProvider>
  ```

- **目标**：消费者只需调用 `Designer` 或 `FormRender`，零额外包裹。

  ```tsx
  // ✅ 现在
  <ConfigProvider theme={{ algorithm }}>
    <Designer adapter={antdAdapter} />
  </ConfigProvider>
  ```

- **方案**：
  - `FormEngineAdapter` 接口新增 `bridgeProvider?: React.ComponentType<BridgeProviderProps>` 字段，adapter 可选声明自己的主题桥接 Provider。
  - `Designer` / `FormRender` 内部自动包裹 `StyleProvider` + adapter 的 `bridgeProvider`：
    - 若消费者已在外层包裹 `StyleProvider`（通过 `useHasStyleProvider` 检测），则内部不再重复包裹。
    - `Designer` 的 `bridgeProvider` 在 `DesignerInner` 内部根据当前 scene 动态选择（双 adapter 场景下切换到 mobile 时自动使用 `mobileAdapter.bridgeProvider`）。
    - `FormRender` 的 `bridgeProvider` 根据 `scene` 解析的 adapter 选择。
  - `Designer` / `FormRender` 新增 `themeMode` / `sizeMode` / `theme` props，透传给 `StyleProvider`。
  - `adapter-antd` 声明 `bridgeProvider: AntdBridgeProvider`。
  - `adapter-antd-mobile` 声明 `bridgeProvider: AntdMobileBridgeProvider`。
  - `AntdBridgeProvider` / `AntdMobileBridgeProvider` 仍保留导出（向后兼容），但消费者不再需要手动使用。
  - `StyleProvider` 保留导出（消费者仍可手动包裹以控制主题，如暗色/紧凑模式）。
- **验证**：
  - example 更新为只包 `ConfigProvider`，移除 `StyleProvider` 和 `AntdBridgeProvider`。
  - 编译通过，测试通过。

---

## 阶段七：`any` 清理收尾

> 目标：阶段一修复了类型基础后，此阶段集中清除 adapter 中的 `any` 用法。

### 7.1 adapter-antd `as any` 清理（对应 6.1） ⬜

- **问题**：~5 处 `: any` + ~13 处 `as any`，依赖阶段一的 `FieldComponentProps` 修复。
- **方案**：待阶段一完成后进行。

### 7.2 adapter-antd-mobile `as any` 清理（对应 6.1、6.2） ⬜

- **问题**：~5 处 `: any` + ~10 处 `as any`，含 8 处 `(fieldSchema.componentProps as any)?.xxx` 模式。
- **方案**：待阶段一完成后进行。

---

## 实施顺序与依赖关系

```
阶段一（类型基础）──→ 阶段七（any 清理）
     │
     ↓
阶段二（注册统一）──→ 阶段四（职责拆分）
     │                     │
     ↓                     ↓
阶段三（性能优化）    阶段五（去重清理）
                           │
                           ↓
                      阶段六（耦合解耦）
```

- 阶段一 → 阶段七：类型基础修复后才能安全清除 adapter `any`。
- 阶段二 → 阶段四：注册统一后组件定义集中，拆分才有稳定基础。
- 阶段三可独立推进，但 3.1 的 Context 拆分建议在阶段四之前完成（拆分 Designer 时需要新的 Context 结构）。
- 阶段五、六相对独立，但建议在阶段四之后（文件结构稳定后再做路径调整）。
- 6.1（Designer-Renderer 解耦）已降级为低优先级，不影响阶段六整体依赖。

### 各阶段已完成项汇总

| 阶段 | 已完成 | 待处理 | 低优先级 |
|------|--------|--------|----------|
| 一（类型基础） | 1.1（索引签名）、1.2（冗余断言） | — | 1.3（事件类型 🟡 部分完成，any→unknown 已改，泛型方案因命名冲突搁置） |
| 二（注册统一） | 2.1（Registry 驱动）、2.3（widgets.tsx 清理） | — | 2.2（共享 DefaultField 🔽 低优先级） |
| 三（Context 拆分） | 3.1（DesignerContext 拆分）、3.3（NestedFieldRenderer）、3.4（eventContext）、3.5（filter 缓存） | — | 3.2（memo 🟡 部分完成，FieldRenderer/CanvasToolbar 已加，PropertyPanelInner 等后续补） |
| 四（职责拆分） | 4.3（表达式独立 hook）、4.4（容器注册表）、4.5（reducer 拆分） | — | 4.1（PropertyPanel 🟡 主文件已拆至 126 行，6 个文件抽出，componentProps 防抖模式保留）、4.2（Designer 🟡 主文件已拆至 148 行，Dnd/useDesignerSync 抽出） |
| 五（去重清理） | 5.1（ToolbarButton）、5.3（useAdaptiveAdapter） | — | 5.2（collectFieldNames 🔽 低优先级） |
| 六（耦合解耦） | 6.2（Context Provider 提升）、6.3（FormRender 状态提取）、6.4（Adapter 主题自动映射 — Designer/FormRender 内部自动包裹 StyleProvider + bridgeProvider） | — | 6.1（Designer-Renderer 解耦 🔽 低优先级） |
| 七（any 清理） | 7.1、7.2 大部分已清理（Table/Tabs/Collapse/DatePicker/InputNumber/Button/Flex/Select/ButtonGroup 等），剩余 antd API 边界 as any 已标注 | — | — |

---

## 风险与回退策略

| 阶段 | 风险 | 回退策略 |
|------|------|---------|
| 一 | 类型修改可能影响隐式依赖 | 逐文件修改，每步编译验证 |
| 二 | 注册表合并涉及 27+ 组件 | 逐个迁移，新旧注册表并行运行直到全部迁移 |
| 三 | Context 拆分影响面广 | 先拆分，保留旧 Context 作为兼容层，逐步迁移 consumer |
| 四 | 大文件拆分改动量大 | 每个文件独立拆分，拆完即验证 |
| 五 | 低风险 | — |
| 六 | 低风险（主要项已提前完成） | — |
| 七 | 依赖阶段一完成 | — |
