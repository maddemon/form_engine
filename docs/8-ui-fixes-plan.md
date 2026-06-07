# 8 项 UI 修复计划

## 概述

修复设计器和渲染器中的 8 个 UI 问题，涉及卡片标题、容器拖拽区、分段控制器、多行文本、隐藏属性、文本/标题组件、Radio 组件。

---

## 问题 1：卡片标题设计界面看不到

**根因**：`CardContainerContent` 在卡片为空时（`field.children.length === 0`）直接返回 `<EmptyContainerPlaceholder />`，跳过了 `SelfRenderedContainer`，导致 Card 适配器未渲染，标题不可见。

**修复**：始终通过 `SelfRenderedContainer` 渲染卡片，空状态时将 `EmptyContainerPlaceholder` 作为卡片 body 内容传入。

**文件**：`packages/core/src/designer/ContainerPreview/CardContainerContent.tsx`

- 移除空状态提前返回逻辑
- 始终构建 cardBody（空时放 `EmptyContainerPlaceholder`，非空时放 `SortableContext + NestedField`）
- 始终通过 `SelfRenderedContainer` 渲染

---

## 问题 2：子表单、Tabs、折叠面板在设计界面（mobile）看不到可拖拽区域

**根因**：
- **Tabs / Collapse**：使用 `SelfRenderedContainer` 渲染适配器组件。适配器组件（antd-mobile）从 `fieldSchema.children` 读取子字段并直接渲染，不会渲染注入的 `RegionDroppable` React children，导致拖拽区域丢失。
- **SubForm**：移动端已用 `RegionPreview` 渲染，但未包裹在 SubForm 的视觉容器中，且空列时直接返回 `EmptyContainerPlaceholder` 跳过了容器框架。

**修复**：

### Tabs（`packages/core/src/designer/ContainerPreview/TabsContainerContent.tsx`）

- 新增 `scene === 'mobile'` 分支
- 移动端不使用 `SelfRenderedContainer`，改为自行渲染 Tabs 结构：
  - 渲染 tab 头部（可点击切换 activeTab）
  - 每个 tab panel 内放 `RegionDroppable`
- 桌面端保持现有 `SelfRenderedContainer` 逻辑

### Collapse（`packages/core/src/designer/ContainerPreview/CollapseContainerContent.tsx`）

- 新增 `scene === 'mobile'` 分支
- 移动端不使用 `SelfRenderedContainer`，改为自行渲染 Collapse 结构：
  - 渲染 panel 头部（可展开/折叠）
  - 每个 panel 内容区放 `RegionDroppable`
- 桌面端保持现有 `SelfRenderedContainer` 逻辑

### SubForm（`packages/core/src/designer/ContainerPreview/SubFormContainerContent.tsx`）

- 移动端空列时也通过 `SelfRenderedContainer` 渲染 SubForm 框架，内部放 `EmptyContainerPlaceholder`
- 确保移动端 `RegionPreview` 在 SubForm 容器内可见

---

## 问题 3：分段控制器组件，设计和渲染都看不到选项

**根因**：`FieldRenderer`（`packages/core/src/renderer/FieldRenderer.tsx` 第 177-179 行）从 `componentProps` 中剥离了 `options`，用 `resolvedOptions` 替代。但 `resolvedOptions` 的计算链（mock → props.options → dataSource.static.options → []）不包含 `componentProps.options`，导致 Segment 的选项丢失。

**修复**：在 `resolvedOptions` 的 fallback 链中加入 `field.componentProps?.options`。

**文件**：`packages/core/src/renderer/FieldRenderer.tsx`

- 修改 `resolvedOptions` 计算：在 `field.dataSource` 之后、空数组之前，加入 `(field.componentProps?.options as OptionItem[] | undefined)?.length ? field.componentProps.options : []` 作为 fallback

---

## 问题 4：多行文本缺少 AutoSize 属性

**根因**：`TextAreaProps` 类型已定义 `autoSize`，antd 适配器已支持传递，但属性面板未暴露。

**修复**：在属性面板中添加 AutoSize 配置。

**文件**：`packages/core/src/components/textarea/Props.tsx`

- 添加 `autoSize` 开关（`w.Switch`），开启后可选配置 `minRows` / `maxRows`（`w.NumberInput`）

---

## 问题 5：是否隐藏也可以做成 是否只读/禁用 那样带一个 switch + 一个函数

**根因**：`hidden` 属性当前仅使用 `ExpressionEditorSlot`（纯表达式输入），没有 Switch 切换模式。而 `disabled` / `readOnly` 使用 `StaticExpressionToggle` 组件支持 Switch + 表达式双模式。

**修复**：将 `hidden` 改为使用 `StaticExpressionToggle`。

**文件**：
- `packages/core/src/designer/PropertyPanel/StaticExpressionToggle.tsx`：扩展 `propKey` 类型，加入 `'hidden'`
- `packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`：将 hidden 的 `ExpressionEditorSlot` 替换为 `StaticExpressionToggle`，propKey 为 `'hidden'`，label 为 `'是否隐藏'`
- `packages/core/src/types/schema.ts`：确认 `hidden` 类型为 `boolean | string`（已满足）

---

## 问题 6：文本内容换行没有展示，颜色属性可以去掉了

**根因**：
- 换行：antd `Typography.Text` 和 antd-mobile 自定义实现都不会将 `\n` 渲染为换行
- 颜色：用户要求移除 `color` 属性

**修复**：

### 换行支持

**文件**：`packages/adapter-antd/src/components/Text.tsx`
- 在 `mergedStyle` 中添加 `whiteSpace: 'pre-wrap'`

**文件**：`packages/adapter-antd-mobile/src/components/Text.tsx`
- 在外层 `<span>` 的 style 中添加 `whiteSpace: 'pre-wrap'`

### 移除颜色属性

**文件**：`packages/core/src/components/text/Props.tsx`
- 移除 "颜色" `<FieldItem>` 配置项

**文件**：`packages/core/src/components/text/types.ts`
- 移除 `color?: string` 属性

**文件**：`packages/adapter-antd/src/components/Text.tsx`
- 移除 `color` prop 的解构和 `mergedStyle` 中的 color 处理

**文件**：`packages/adapter-antd-mobile/src/components/Text.tsx`
- 移除 color 相关处理（当前已无 color 处理）

---

## 问题 7：标题组件的颜色也可以去掉，换成文本内容的类型

**根因**：用户要求移除 `color` 属性，替换为 `type` 属性（语义颜色类型，如 secondary/success/warning/danger）。`TitleProps` 类型已定义 `type` 但属性面板未暴露。

**修复**：

### 属性面板

**文件**：`packages/core/src/components/title/Props.tsx`
- 移除 "颜色" `<FieldItem>`
- 添加 "类型" `<FieldItem>`，使用 `w.Select`，选项：默认/次要/成功/警告/危险

### 类型定义

**文件**：`packages/core/src/components/title/types.ts`
- 移除 `color?: string` 属性

### 适配器

**文件**：`packages/adapter-antd/src/components/Title.tsx`
- 移除 `color` prop 解构和 `mergedStyle` 中的 color 处理
- `type` 已在 `titleProps` 中传递给 antd Title，无需额外修改

**文件**：`packages/adapter-antd-mobile/src/components/Title.tsx`
- 添加 `type` 语义颜色映射（同 Text mobile 适配器的 `typeColorMap`）
- 移除 color 相关处理（当前已无 color 处理）

---

## 问题 8：Radio Button 竖向排列时不要用 ButtonGroup

**根因**：当 `optionType === 'button'` 且 `direction === 'vertical'` 时，`Radio.Group` 会将 `Radio.Button` 渲染为 ButtonGroup 样式（相邻按钮共享边框），竖向排列时边框显示异常。

**修复**：竖向 Button 模式下，不使用 `Radio.Group` 包裹，改为逐个渲染 `Radio.Button`，用 `Flex vertical` 布局，通过内部 state 管理 value。

**文件**：`packages/adapter-antd/src/components/Radio.tsx`

- 当 `optionType === 'button' && direction === 'vertical'` 时：
  - 不使用 `<Group>` 包裹
  - 改为 `<Flex vertical gap={8}>` 内逐个渲染 `<AntRadio.Button>`
  - 每个 Button 通过 `checked` + `onClick` 手动管理选中状态
- 其他情况保持现有逻辑

---

## 验证步骤

1. `pnpm build` 编译通过
2. `pnpm check:tokens` 主题 Token 检查通过
3. 设计器中验证：
   - 空卡片显示标题
   - 移动端子表单/Tabs/折叠面板显示可拖拽区域
   - 分段控制器显示选项
   - 多行文本属性面板有 AutoSize
   - 隐藏属性有 Switch + 表达式切换
   - 文本内容支持换行、无颜色属性
   - 标题组件有类型选择、无颜色属性
   - Radio Button 竖向排列无边框问题
