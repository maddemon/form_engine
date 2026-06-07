# HTML + CSS 重复代码优化计划

## 概述

对 `packages/core/src` 下 designer/、widgets/、renderer/、propRenders/ 四个目录的 HTML + CSS 重复模式进行全面审查，识别出 10 类重复问题，按优先级分批优化。

## 现状分析

### 重复模式总览

| # | 重复模式 | 涉及文件 | 严重程度 |
|---|---------|---------|---------|
| 1 | NestedField vs SortableField 几乎完全重复 | `designer/NestedField.tsx`、`designer/RootFields/SortableField.tsx` | P0 |
| 2 | OptionsEditor vs ItemListEditor 大量重复（SortableRow、arrayMove、拖拽手柄、删除按钮、inputBaseStyle、labelStyle） | `widgets/OptionsEditor.tsx`、`propRenders/ItemListEditor.tsx` | P0 |
| 3 | 空容器占位符文案和样式不统一（7处） | ContainerPreview 下多个文件、Canvas.tsx、RegionPreview.tsx | P1 |
| 4 | disabled/readOnly 静态/表达式切换模式完全重复 | `designer/PropertyPanel/DefaultPropertyContent.tsx` | P1 |
| 5 | h4 小节标题 + 分割线样式重复 | PropertyPanel.tsx、FormConfigPanel.tsx、RulesEditor.tsx | P1 |
| 6 | 容器 FieldRenderer 包裹模式重复（Card/Collapse/Tabs） | ContainerPreview 下 3 个 ContainerContent 文件 | P2 |
| 7 | Tooltip "?" 图标重复 | `propRenders/shared.tsx`、`renderer/FieldRenderer.tsx` | P2 |
| 8 | 错误信息展示样式重复 | DefaultPropertyContent.tsx、ItemListEditor.tsx、FieldRenderer.tsx | P2 |
| 9 | 面板边框样式重复 | PropertyPanel.tsx、FieldList.tsx | P3 |
| 10 | 关闭/删除按钮模式重复 | Select.tsx、ComponentTree.tsx、OptionsEditor.tsx、ItemListEditor.tsx、FieldActions.tsx | P3 |

---

## 优化方案

### P0-1：合并 NestedField 与 SortableField

**现状**：两个组件逻辑几乎完全相同，唯一区别是数据来源：
- `NestedField`：从 `useDesignerSelection()` / `useDesignerConfig()` Context 获取 `selectedFieldId`、`formConfig`、`adapter`
- `SortableField`：通过 props 接收 `selectedFieldId`、`formConfig`、`adapter`

两者都：
- 使用 `useSortable` + `SELF_RENDERED` 集合（重复定义）
- 判断 `isContainer` → `ContainerPreview` vs `FieldRenderer`
- 计算 `needsLabel` → `FormItem` 包裹
- 返回 `<FieldItem>` 包裹

**方案**：
1. 删除 `SortableField.tsx`
2. 修改 `NestedField.tsx`，增加可选 props：`selectedFieldId?`、`formConfig?`、`adapter?`
3. 当 props 未传时，从 Context 获取（兼容现有 NestedField 用法）；当 props 传入时，直接使用（兼容现有 SortableField 用法）
4. 更新 `RootFields/` 下的引用，将 `<SortableField>` 替换为 `<NestedField>` 并传入 props
5. 删除 `SortableField` 中的 `SELF_RENDERED` 定义，统一使用 `NestedField` 中的

**涉及文件**：
- 修改：`packages/core/src/designer/NestedField.tsx`
- 删除：`packages/core/src/designer/RootFields/SortableField.tsx`
- 修改：`packages/core/src/designer/RootFields/RootFields.tsx`（更新引用）
- 修改：`packages/core/src/designer/RootFields/types.ts`（移除 SortableFieldProps 或调整）

---

### P0-2：抽取 OptionsEditor 与 ItemListEditor 的共享逻辑

**现状**：两个编辑器存在 6 处逐行一致的重复代码：

| 重复项 | OptionsEditor 行号 | ItemListEditor 行号 |
|--------|-------------------|-------------------|
| `arrayMove` 函数 | 18-23 | 78-83 |
| `SortableRow` 组件 | 40-79 | 40-76 |
| 拖拽手柄样式 | 54-72 | 142-157 |
| 删除按钮样式 | 253-276 | 258-281 |
| `inputBaseStyle` | 210-219 | 159-168 |
| `labelStyle` | 221-225 | 170-174 |

**方案**：
1. 新建 `packages/core/src/widgets/sortableListShared.tsx`，导出：
   - `arrayMove<T>(arr, from, to)` 工具函数
   - `SortableRow` 组件（统一接口，接收 `id`、`sortable`、`dragHandle`、`children`）
   - `DragHandleIcon` 组件（拖拽手柄图标，接收 `disabled`、`sortable` props）
   - `InlineDeleteButton` 组件（删除按钮，接收 `disabled`、`onClick`、`title` props）
   - `inputBaseStyle(token, disabled)` 样式工厂函数
   - `labelStyle(token)` 样式工厂函数
2. 修改 `OptionsEditor.tsx` 和 `ItemListEditor.tsx`，删除各自的重复定义，改为从 `sortableListShared` 导入

**涉及文件**：
- 新建：`packages/core/src/widgets/sortableListShared.tsx`
- 修改：`packages/core/src/widgets/OptionsEditor.tsx`
- 修改：`packages/core/src/propRenders/ItemListEditor.tsx`

---

### P1-1：统一空容器占位符

**现状**：7 处空状态提示，文案和样式不统一：

| 文件 | 文案 | 样式方式 |
|------|------|---------|
| `EmptyContainerPlaceholder.tsx` | "拖入组件" | `useEmptyContainerStyle` hook |
| `FlexContainerContent.tsx` | "拖入组件" | `useEmptyContainerStyle` hook |
| `GenericContainerContent.tsx` | "拖入组件" | `useEmptyContainerStyle` hook |
| `CardContainerContent.tsx` | "拖拽组件到此处" | 内联样式 |
| `RegionDroppable.tsx` | "拖拽组件到此处" | 内联样式 |
| `RegionPreview.tsx` | "拖拽组件到此处" | 内联样式 |
| `Canvas.tsx` | "从左侧拖拽控件到此处" | 内联样式+虚线边框 |

**方案**：
1. 扩展 `EmptyContainerPlaceholder` 组件，增加 `text?` 和 `variant?: 'simple' | 'dashed'` props
   - `simple`：纯文本占位（当前默认行为）
   - `dashed`：带虚线边框的画布级占位（Canvas 场景）
2. 统一文案为 "拖入组件"（简短统一）
3. 将 `CardContainerContent`、`RegionDroppable`、`RegionPreview` 中的内联占位替换为 `<EmptyContainerPlaceholder>`
4. `Canvas.tsx` 使用 `<EmptyContainerPlaceholder variant="dashed" text="从左侧拖拽控件到此处" />`

**涉及文件**：
- 修改：`packages/core/src/designer/ContainerPreview/EmptyContainerPlaceholder.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/CardContainerContent.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/RegionDroppable.tsx`
- 修改：`packages/core/src/designer/RegionPreview.tsx`
- 修改：`packages/core/src/designer/Canvas.tsx`

---

### P1-2：抽取 disabled/readOnly 静态/表达式切换组件

**现状**：`DefaultPropertyContent.tsx` 中 "禁用"（255-295行）和 "只读"（296-336行）两个字段有完全相同的切换模式：
- `mode` 状态 + `useEffect` 同步
- `exprValue` 防抖输入
- Switch / ExpressionEditorSlot 条件渲染
- "ƒ"/"≡" 切换按钮（样式完全一致）

**方案**：
1. 新建 `packages/core/src/designer/PropertyPanel/StaticExpressionToggle.tsx`，封装：
   - Props：`label`、`staticValue`、`exprValue`、`onStaticChange`、`onExprChange`、`field`、`fieldNames`、`widgets`、`dispatch`
   - 内部管理 `mode` 状态 + `useEffect` 同步
   - 渲染 Switch / ExpressionEditorSlot + 切换按钮
2. `DefaultPropertyContent.tsx` 中两处替换为 `<StaticExpressionToggle />`

**涉及文件**：
- 新建：`packages/core/src/designer/PropertyPanel/StaticExpressionToggle.tsx`
- 修改：`packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`

---

### P1-3：抽取 SectionTitle 和 Divider 组件

**现状**：
- h4 标题样式在 5+ 处重复，margin/fontSize/color 不一致
- 分割线有两种实现（独立 div vs borderTop），混用 `--fe-border-primary` 和 `--fe-border-light`

**方案**：
1. 在 `packages/core/src/designer/shared.tsx`（或新建 `packages/core/src/designer/UIPrimitives.tsx`）中导出：
   - `SectionTitle`：支持 `variant: 'primary' | 'secondary'`，统一 margin/fontSize/color
   - `Divider`：统一分割线样式，支持 `orientation?: 'horizontal' | 'vertical'`
2. 替换 PropertyPanel.tsx、FormConfigPanel.tsx、RulesEditor.tsx 中的内联实现

**涉及文件**：
- 新建：`packages/core/src/designer/UIPrimitives.tsx`
- 修改：`packages/core/src/designer/PropertyPanel.tsx`
- 修改：`packages/core/src/designer/FormConfigPanel.tsx`
- 修改：`packages/core/src/designer/RulesEditor.tsx`
- 修改：`packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`

---

### P2-1：抽取容器 FieldRenderer 包裹模式

**现状**：`CardContainerContent`、`CollapseContainerContent`、`TabsContainerContent` 三个组件共享完全相同的包裹模式：
```tsx
const enhancedField: FormFieldSchema = { ...field, componentProps: { ...field.componentProps, children: panelChildren } }
return (
  <div style={{ pointerEvents: 'auto' }}>
    <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
  </div>
)
```

**方案**：
1. 在 `ContainerPreview/` 下新建 `SelfRenderedContainer.tsx`，封装 enhancedField 构造 + pointerEvents 包裹 + FieldRenderer 调用
2. 三个 ContainerContent 组件改为使用 `<SelfRenderedContainer>`

**涉及文件**：
- 新建：`packages/core/src/designer/ContainerPreview/SelfRenderedContainer.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/CardContainerContent.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/CollapseContainerContent.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/TabsContainerContent.tsx`

---

### P2-2：抽取 TooltipIcon 组件

**现状**：`propRenders/shared.tsx`（第18-23行）和 `renderer/FieldRenderer.tsx`（第79-82行）有完全一致的 "?" tooltip 图标：
```tsx
<span title={tooltip} style={{ marginLeft: 'var(--fe-spacing-xs, 4px)', cursor: 'help', color: token('textTertiary') }}>?</span>
```

**方案**：
1. 在 `packages/core/src/designer/UIPrimitives.tsx`（P1-3 新建的文件）中增加 `TooltipIcon` 组件
2. 替换 `propRenders/shared.tsx` 和 `renderer/FieldRenderer.tsx` 中的内联实现

**涉及文件**：
- 修改：`packages/core/src/designer/UIPrimitives.tsx`（增加 TooltipIcon）
- 修改：`packages/core/src/propRenders/shared.tsx`
- 修改：`packages/core/src/renderer/FieldRenderer.tsx`

---

### P2-3：抽取 ErrorMessage 组件

**现状**：3 处错误信息样式不一致：
- `DefaultPropertyContent.tsx`：`fontSize: token('fontSizeXs'), color: 'var(--fe-error)'`
- `ItemListEditor.tsx`：`color: 'var(--fe-error)', fontSize: token('fontSizeXs'), marginBottom: token('spacingXs')`
- `FieldRenderer.tsx`：`color: token('error'), fontSize: token('fontSizeXs'), marginTop: token('spacingXs')`

**方案**：
1. 在 `UIPrimitives.tsx` 中增加 `ErrorMessage` 组件，支持 `margin` 方向 prop
2. 替换 3 处内联实现

**涉及文件**：
- 修改：`packages/core/src/designer/UIPrimitives.tsx`（增加 ErrorMessage）
- 修改：`packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`
- 修改：`packages/core/src/propRenders/ItemListEditor.tsx`
- 修改：`packages/core/src/renderer/FieldRenderer.tsx`

---

### P3-1：抽取面板边框样式常量

**现状**：`borderLeft: '1px solid var(--fe-border-light)'` 和 `borderRight: '1px solid var(--fe-border-light)'` 在 PropertyPanel.tsx 和 FieldList.tsx 中重复。

**方案**：
1. 在 `UIPrimitives.tsx` 中导出 `PANEL_BORDER_STYLE` 常量
2. 替换内联样式

**涉及文件**：
- 修改：`packages/core/src/designer/UIPrimitives.tsx`
- 修改：`packages/core/src/designer/PropertyPanel.tsx`
- 修改：`packages/core/src/designer/FieldList/FieldList.tsx`

---

### P3-2：抽取 IconButton 组件

**现状**：5 处使用 "✕" 关闭/删除按钮，样式各不相同但模式一致。

**方案**：
1. 在 `UIPrimitives.tsx` 中增加 `IconButton` 组件，支持 `variant: 'close' | 'delete' | 'clear'`
2. 逐步替换，优先替换样式最接近的场景

**涉及文件**：
- 修改：`packages/core/src/designer/UIPrimitives.tsx`
- 修改：`packages/core/src/widgets/Select.tsx`
- 修改：`packages/core/src/designer/ComponentTree.tsx`
- 修改：`packages/core/src/widgets/OptionsEditor.tsx`（已在 P0-2 中用 InlineDeleteButton 处理）
- 修改：`packages/core/src/propRenders/ItemListEditor.tsx`（已在 P0-2 中用 InlineDeleteButton 处理）

---

## 实施顺序

按优先级分批实施，每批完成后编译验证：

1. **第一批（P0）**：P0-1 合并 NestedField/SortableField + P0-2 抽取 sortableListShared
2. **第二批（P1）**：P1-1 统一空容器占位符 + P1-2 抽取 StaticExpressionToggle + P1-3 抽取 SectionTitle/Divider
3. **第三批（P2）**：P2-1 抽取 SelfRenderedContainer + P2-2 抽取 TooltipIcon + P2-3 抽取 ErrorMessage
4. **第四批（P3）**：P3-1 面板边框常量 + P3-2 IconButton

## 验证步骤

每批完成后：
1. `pnpm build` 编译通过
2. `pnpm check:tokens` 主题 Token 检查通过
3. `pnpm test` 测试通过
4. 启动 example 应用，手动验证属性面板、画布拖拽、容器嵌套等功能正常

## 假设与决策

- **不引入新依赖**：所有抽取的组件使用项目现有的 React + useStyle 模式
- **保持向后兼容**：新组件的 props 设计覆盖现有所有使用场景
- **UIPrimitives.tsx 定位**：作为 designer 目录下的小型 UI 原子组件集合，与 widgets/（面向属性面板的编辑控件）形成层级区分
- **不修改 Widget 接口**：`DesignerWidgets` 类型保持不变，P0-2 的共享逻辑仅影响 Widget 内部实现
