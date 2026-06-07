# HTML + CSS 重复代码优化计划（第二轮）

## 概述

第一轮优化已完成 10 项重复模式消除（P0-1 ~ P3-2），包括：
- 合并 NestedField/SortableField
- 抽取 sortableListShared.tsx
- 创建 UIPrimitives.tsx（SectionTitle、Divider、TooltipIcon、ErrorMessage、PANEL_BORDER、IconButton）
- 创建 StaticExpressionToggle.tsx、SelfRenderedContainer.tsx
- 增强 EmptyContainerPlaceholder.tsx

本轮核心策略：**扩展 WidgetButton 支持 `type="text"` 无边框模式**（类似 antd Button 的 text 类型），统一项目中散落的"无边框/透明背景"按钮模式，同时处理其他重复问题。

---

## 现状分析：新发现的重复模式

| # | 重复模式 | 涉及文件 | 优先级 |
|---|---------|---------|--------|
| R1 | WidgetButton 缺少 `type="text"` 无边框模式，导致多处手写无边框按钮 | Button.tsx + 6+ 处使用方 | 高 |
| R2 | ItemListEditor 添加按钮应改用 WidgetButton | ItemListEditor.tsx:199-225 | 高 |
| R3 | ItemListEditor/OptionsEditor 行容器样式重复 | ItemListEditor.tsx:111-120, OptionsEditor.tsx:172-181 | 高 |
| R4 | Input/NumberInput/TextArea/ExpressionInput disabled+focused 样式展开重复 | Input.tsx:21-27, NumberInput.tsx:25-31, TextArea.tsx:26-33, ExpressionInput.tsx:130-137 | 中 |
| R5 | DataSourceEditor baseInputStyle 与 BASE_STYLE 重复 | DataSourceEditor.tsx:57-65 | 中 |
| R6 | ExpressionInput/DataSourceEditor 标签/标记样式重复 | ExpressionInput.tsx:75-89, DataSourceEditor.tsx:93-102 | 中 |
| R7 | FlexContainerContent/GenericContainerContent 空占位未统一 | FlexContainerContent.tsx:27-29, GenericContainerContent.tsx:22-24 | 低 |
| R8 | CustomPropsRender textarea fallback 样式与 BASE_STYLE 重复 | CustomPropsRender.tsx:40-46 | 低 |

---

## 优化方案

### R1：扩展 WidgetButton 支持 `type="text"` + 统一替换

**现状**：项目中至少 6 处使用"无边框 + 透明背景"按钮模式，每处都手写 `border: 'none'` + `background: 'transparent'` + `cursor: 'pointer'` 等样式：

| 位置 | 当前实现 | 可替换为 |
|------|---------|---------|
| Select.tsx:97-119 清除按钮 | `<span>` + 绝对定位 + 12行内联样式 | `<WidgetButton type="text" size="sm">` + 定位包裹 |
| ExpressionInput.tsx:139-162 "ƒ"按钮 | `<button>` + 绝对定位 + 12行内联样式 | `<WidgetButton type="text" size="sm">` + 定位包裹 |
| DefaultPropertyContent.tsx:153-168 眼睛图标 | `<span>` + cursor/display/alignItems | `<WidgetButton type="text" size="sm">` |
| StaticExpressionToggle.tsx:74-94 "ƒ/≡"切换 | `<span>` + cursor/fontSize/color | `<WidgetButton type="text" size="sm">` |
| FieldActions.tsx:25-44 复制/删除图标 | `<span>` + cursor/color/padding | `<WidgetButton type="text" size="sm">` |
| FieldList.tsx:45-66 侧栏 tab 按钮 | `<button>` + border:none + background:transparent | `<WidgetButton type="text" size="sm">` |

**方案**：

1. **扩展 WidgetButton**，在 `type` 联合类型中增加 `'text'`：
   ```tsx
   type?: 'default' | 'primary' | 'danger' | 'dashed' | 'text'
   ```
   `type="text"` 的样式：
   - `border: 'none'`（无边框）
   - `background: 'transparent'`（透明背景）
   - 保留 `color: token('textPrimary')`（可通过 style 覆盖）
   - hover 时添加浅色背景（`var(--fe-bg-secondary)` 或 `var(--fe-primary-hover-bg)`）
   - 保留 `cursor` 和 `disabled` 处理

2. **新增 `InputOverlayButton`**（在 `widgets/shared.tsx`）：
   - 封装"输入框内绝对定位按钮"的通用模式
   - 内部使用 `<WidgetButton type="text">`，外层处理绝对定位
   ```tsx
   interface InputOverlayButtonProps {
     onClick: (e: React.MouseEvent) => void
     disabled?: boolean
     title?: string
     children: React.ReactNode
     style?: React.CSSProperties  // 覆盖 right/color/fontSize 等
   }
   ```
   - 统一 `position: absolute` + `top: 50%` + `transform: translateY(-50%)` + `right: 1`

3. **逐个替换**：
   - Select.tsx 清除按钮 → `<InputOverlayButton>`
   - ExpressionInput.tsx "ƒ"按钮 → `<InputOverlayButton>`
   - DefaultPropertyContent.tsx 眼睛图标 → `<WidgetButton type="text" size="sm">`
   - StaticExpressionToggle.tsx "ƒ/≡"切换 → `<WidgetButton type="text" size="sm">`
   - FieldActions.tsx 复制/删除图标 → `<WidgetButton type="text" size="sm">`
   - FieldList.tsx 侧栏 tab 按钮 → `<WidgetButton type="text" size="sm">`

4. **评估 UIPrimitives.tsx 中的 IconButton**：
   - `IconButton` 与 `WidgetButton type="text"` 功能高度重叠
   - 替换完成后，检查 `IconButton` 的使用方（ComponentTree.tsx），考虑是否也迁移到 `WidgetButton type="text"`
   - 若全部迁移完成，可删除 `IconButton` 减少概念重复

**涉及文件**：
- 修改：`packages/core/src/widgets/Button.tsx`（增加 type="text"）
- 新增：`packages/core/src/widgets/shared.tsx`（InputOverlayButton，从 shared.ts 独立出来放组件）
- 修改：`packages/core/src/widgets/Select.tsx`
- 修改：`packages/core/src/widgets/ExpressionInput.tsx`
- 修改：`packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`
- 修改：`packages/core/src/designer/PropertyPanel/StaticExpressionToggle.tsx`
- 修改：`packages/core/src/designer/FieldItem/FieldActions.tsx`
- 修改：`packages/core/src/designer/FieldList/FieldList.tsx`
- 评估：`packages/core/src/designer/UIPrimitives.tsx`（IconButton 去留）

---

### R2：ItemListEditor 添加按钮改用 WidgetButton

**现状**：ItemListEditor 使用原生 `<button>` + 约 20 行内联样式实现虚线添加按钮，而 OptionsEditor 已使用 `WidgetButton type="dashed"` 实现相同视觉效果。

**方案**：
1. ItemListEditor 导入 `WidgetButton`
2. 将原生 `<button>` 替换为 `<WidgetButton type="dashed" size="sm">`，与 OptionsEditor 统一
3. 删除 `onMouseEnter`/`onMouseLeave` 内联事件处理（WidgetButton 内部已处理 hover）

**涉及文件**：
- 修改：`packages/core/src/propRenders/ItemListEditor.tsx`

---

### R3：抽取 SortableRowContent 样式到 sortableListShared

**现状**：ItemListEditor 和 OptionsEditor 的行内容容器样式完全一致：
```tsx
display: 'flex', alignItems: 'center', gap: token('spacingXs'),
marginBottom: token('spacingXs'), background: 'var(--fe-bg-primary)',
padding: '2px 4px', borderRadius: token('borderRadiusSm') / 'var(--fe-border-radius-sm)'
```

**方案**：
1. 在 `sortableListShared.tsx` 中新增 `getSortableRowContentStyle(token)` 工厂函数
2. 两个编辑器改用该函数

**涉及文件**：
- 修改：`packages/core/src/widgets/sortableListShared.tsx`
- 修改：`packages/core/src/propRenders/ItemListEditor.tsx`
- 修改：`packages/core/src/widgets/OptionsEditor.tsx`

---

### R4：抽取 getInputControlStyle 工具函数

**现状**：Input、NumberInput、TextArea、ExpressionInput 四个组件的样式展开逻辑完全相同：
```tsx
style={{
  ...BASE_STYLE,
  ...(focused ? FOCUS_STYLE : {}),
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? 'not-allowed' : 'text',
  ...style,
}}
```

**方案**：
1. 在 `widgets/shared.ts` 中新增 `getInputControlStyle(options)` 工厂函数：
   ```ts
   function getInputControlStyle(options: {
     focused?: boolean
     disabled?: boolean
     style?: React.CSSProperties
   }): React.CSSProperties
   ```
2. 四个组件改用该函数，减少重复的展开逻辑

**涉及文件**：
- 修改：`packages/core/src/widgets/shared.ts`
- 修改：`packages/core/src/widgets/Input.tsx`
- 修改：`packages/core/src/widgets/NumberInput.tsx`
- 修改：`packages/core/src/widgets/TextArea.tsx`
- 修改：`packages/core/src/widgets/ExpressionInput.tsx`

---

### R5：DataSourceEditor baseInputStyle 改用 BASE_STYLE

**现状**：DataSourceEditor.tsx 自定义了 `baseInputStyle`，与 `shared.ts` 的 `BASE_STYLE` 高度重复，仅 `padding` 值略有差异（`3px 6px` vs `1px 6px`）且 `fontSize` 用 token 而非 CSS 变量。

**方案**：
1. 导入 `BASE_STYLE`，基于它覆盖差异属性：
   ```tsx
   const baseInputStyle: React.CSSProperties = { ...BASE_STYLE, padding: '3px 6px' }
   ```

**涉及文件**：
- 修改：`packages/core/src/widgets/DataSourceEditor.tsx`

---

### R6：抽取 TagLabel 组件

**现状**：ExpressionInput.tsx 的字段名按钮和 DataSourceEditor.tsx 的依赖标签共享"小圆角边框 + 三级背景 + 小字号"的标签样式，差异仅在 `color` 和 `fontFamily`。

**方案**：
1. 在 `widgets/shared.tsx` 中新增 `TagLabel` 组件：
   ```tsx
   interface TagLabelProps {
     children: React.ReactNode
     variant?: 'primary' | 'secondary'  // primary=主题色, secondary=文本色
     fontFamily?: string
     style?: React.CSSProperties
   }
   ```
2. ExpressionInput.tsx 和 DataSourceEditor.tsx 改用 `<TagLabel>`

**涉及文件**：
- 修改：`packages/core/src/widgets/shared.tsx`（新增 TagLabel）
- 修改：`packages/core/src/widgets/ExpressionInput.tsx`
- 修改：`packages/core/src/widgets/DataSourceEditor.tsx`

---

### R7：FlexContainerContent/GenericContainerContent 空占位统一

**现状**：两个组件因已使用 `useDroppable` 而无法直接使用 `EmptyContainerPlaceholder`（后者内部也调用 `useDroppable`，会导致 id 冲突）。

**方案**：
1. 为 `EmptyContainerPlaceholder` 新增 `skipDroppable?: boolean` prop
2. 当 `skipDroppable=true` 时，不调用 `useDroppable`，仅渲染占位内容（由外层组件负责 droppable）
3. FlexContainerContent 和 GenericContainerContent 在空状态分支改用 `<EmptyContainerPlaceholder skipDroppable />`

**涉及文件**：
- 修改：`packages/core/src/designer/ContainerPreview/EmptyContainerPlaceholder.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/FlexContainerContent.tsx`
- 修改：`packages/core/src/designer/ContainerPreview/GenericContainerContent.tsx`

---

### R8：CustomPropsRender textarea fallback 改用 BASE_STYLE

**现状**：fallback textarea 的样式与 `BASE_STYLE` 重复。

**方案**：
1. 导入 `BASE_STYLE`，基于它覆盖差异属性（`resize`、`rows` 相关）

**涉及文件**：
- 修改：`packages/core/src/propRenders/CustomPropsRender.tsx`

---

## 实施顺序

按优先级分批实施，每批完成后编译验证：

1. **第一批（核心：WidgetButton type="text"）**：R1 扩展 WidgetButton + InputOverlayButton + 6 处替换
2. **第二批（高优先级）**：R2 WidgetButton 统一 + R3 SortableRowContent
3. **第三批（中优先级）**：R4 getInputControlStyle + R5 BASE_STYLE 复用 + R6 TagLabel
4. **第四批（低优先级）**：R7 空占位统一 + R8 textarea fallback + IconButton 去留评估

## 验证步骤

每批完成后：
1. `pnpm build` 编译通过
2. `pnpm check:tokens` 主题 Token 检查通过
3. `pnpm test` 测试通过

## 假设与决策

- **WidgetButton type="text" 是核心方案**：类似 antd 的 text 按钮，无边框 + 透明背景 + hover 浅色背景，统一项目中所有"纯文字/图标按钮"场景
- **InputOverlayButton 封装定位逻辑**：输入框内覆盖层按钮的绝对定位是特殊需求，单独封装为组件，内部使用 WidgetButton type="text"
- **IconButton 去留待评估**：如果 WidgetButton type="text" 能覆盖所有 IconButton 场景，则删除 IconButton 减少概念重复；否则保留
- **TagLabel 放在 widgets/shared.tsx**：标签样式仅在 Widget 层使用
- **skipDroppable 方案**：通过条件跳过 `useDroppable` 调用，避免 id 冲突，同时保持占位样式统一
- **不修改 Widget 接口**：所有优化仅影响内部实现，`DesignerWidgets` 类型不变
