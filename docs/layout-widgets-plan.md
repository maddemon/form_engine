# 布局 Widget 方案

**状态：已确认**

---

## 决策结论

| 决策点 | 结论 |
|---|---|
| 是否新增布局组件 | **是**，在 core 内部新增 `Space`、`Space.Compact`、`Divider`、`Text` |
| 组件位置 | `packages/core/src/widgets/`，作为 core 内部工具，**不暴露到 `DesignerWidgets` 接口** |
| 替换范围 | **整个 core**（`widgets/`、`designer/`、`propRenders/`、`renderer/`），能替换的全替换 |
| 替换原则 | 必须理解每种 `div+style` 的**原始意图**，不能机械替换 |
| 命名冲突 | 表单渲染器已有 `Divider`（`components/divider/`）和 `Text`（`components/text/`），布局 widget 通过导入路径区分：`import { Space, Divider, Text } from '../widgets'`，而非从 `components/` 导入 |

---

## 当前状态分析

### 问题规模
- **51 个文件**在 `packages/core/src/` 中使用 `<div style=...>` 或 `style={{` 进行布局
- **180 处** `style={{` 内联样式（其中 `display: 'flex'` 占 47 处）
- 排除 token 定义文件、测试文件等非布局用途后，纯布局用途文件约 **46-48 个**

### 高频布局模式及原始意图

#### 模式 1：`display: 'flex'` + `gap` + `alignItems: 'center'`（~25%）
**原始意图**：水平排列子元素，统一间距，垂直居中对齐。这是最常见的"行内控件组"布局。

典型示例：
```tsx
// 标签 + 输入框水平排列
<div style={{ display: 'flex', gap: token('spacingXs'), alignItems: 'center', flex: 1 }}>
  <w.Input ... />
  <WidgetButton ... />
</div>

// 操作按钮组
<div style={{ display: 'flex', gap: token('spacingXs') }}>
  <WidgetButton ... />
  <WidgetButton ... />
</div>
```

**→ 替换为 `<Space>`**（水平方向，默认 `alignItems: 'center'`）

#### 模式 2：`display: 'flex'` + `flexDirection: 'column'` + `gap`（~12%）
**原始意图**：垂直堆叠子元素，统一间距。典型的"表单区域"或"配置区块"布局。

```tsx
// 垂直表单
<div style={{ display: 'flex', flexDirection: 'column', gap: token('spacingSm') }}>
  <FieldItem ... />
  <FieldItem ... />
</div>
```

**→ 替换为 `<Space direction="vertical">`**

#### 模式 3：`display: 'flex'` + `alignItems: 'center'`（无 gap）（~16%）
**原始意图**：紧凑水平排列，子元素紧密相邻（如输入框 + 后缀按钮，图标 + 文字）。这是"紧凑组合"模式。

```tsx
// 输入框 + 后缀图标
<div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
  <WidgetInput ... />
  <WidgetButton ... />
</div>
```

**→ 替换为 `<Space.Compact>`**

#### 模式 4：边框分隔线（~4%）
**原始意图**：视觉分隔不同配置区块。有两种方向：
- `borderTop: '1px solid var(--fe-border-light)'` + `paddingTop`（2 处）— 上边线分隔
- `borderBottom: '1px solid ...'`（5 处）— 下边线分隔

```tsx
// 上边线分隔
<div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm') }}>
  ...
</div>

// 下边线分隔
<div style={{ borderBottom: '1px solid var(--fe-border-light)' }}>
  ...
</div>
```

**→ 替换为 `<Divider>`**（支持 `direction` 属性区分上下）

#### 模式 5：`fontSize` + `color` 文本样式（~10%）
**原始意图**：标签、提示、描述文字的颜色和字号控制。有三种语义层级：
- `text-secondary`（次要标签）：`fontSizeXs` + `var(--fe-text-secondary)`
- `text-tertiary`（辅助提示）：`fontSizeXs` + `var(--fe-text-tertiary)`
- `placeholder`（占位）：`fontSizeSm` + `var(--fe-text-placeholder)`

```tsx
// 标签
<div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-secondary)', marginBottom: token('spacingXs') }}>
  接口地址（GET）
</div>

// 辅助提示
<div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginTop: '2px' }}>
  用 {fieldName} 引用其他字段的值
</div>
```

**→ 替换为 `<Text type="secondary">` / `<Text type="tertiary">`**

#### 模式 6：`marginBottom` / `marginTop` 间距（~17%）
**原始意图**：用 margin 做垂直间距，而非 flex + gap。共 30 处（marginBottom 20 处，marginTop 10 处）。

常见于两种场景：
1. **连续同级子元素**用 `marginBottom` 做间距 → 可替换为 `<Space direction="vertical">`
2. **单个元素的 margin**（如标签与输入框间距、提示文字的 marginTop）→ 保留 margin，或用 Text 的 `style` 透传

```tsx
// 场景 1：连续同级元素
<div style={{ marginBottom: token('spacingSm') }}>
  <FieldItem />
</div>
<div style={{ marginBottom: token('spacingSm') }}>
  <FieldItem />
</div>

// 场景 2：单个元素间距
<div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-secondary)', marginBottom: token('spacingXs') }}>
  接口地址（GET）
</div>
```

**→ 场景 1 替换为 `<Space direction="vertical">`，场景 2 保留 margin 或通过组件 `style` 透传**

#### 模式 7：`flex: 1` 弹性分配（~12%）
**原始意图**：子元素等分或按比例分配剩余空间。共 21 处。

```tsx
// 两列等宽
<div style={{ display: 'flex', gap: token('spacingSm') }}>
  <div style={{ flex: 1 }}>左列</div>
  <div style={{ flex: 1 }}>右列</div>
</div>
```

**→ 保留 `flex: 1` 在子元素 `style` 上，外层容器用 `<Space>` 替换**

#### 模式 8：`width: '100%'` 全宽（~7%）
**原始意图**：元素占满父容器宽度。共 13 处。

**→ 保留在子元素 `style` 上，不属于 Space 替换范围**

#### 模式 9：`minWidth: 0` flex 防溢出（~4%）
**原始意图**：flex 子元素防止内容溢出容器的常见技巧。共 7 处。

**→ 保留在子元素 `style` 上，替换外层容器时不影响**

#### 模式 10：`lineHeight` 硬编码（~7%）
**原始意图**：行高控制，常见值 `1`、`1.5`、`1.6`。共 12 处。

**→ Text 组件支持 `lineHeight` 透传，或通过 `style` 透传**

#### 模式 11：`textOverflow: 'ellipsis'` + `whiteSpace: 'nowrap'`（~5%）
**原始意图**：文本截断显示。`textOverflow: 'ellipsis'` 2 处，`whiteSpace: 'nowrap'` 8 处。

**→ Text 组件支持 `ellipsis` 属性**

### 不可替换的模式（需特殊处理）

| 模式 | 出现频次 | 原因 | 处理方式 |
|---|---|---|---|
| `style={{ ...style }}`（展开父级 style） | — | 动态外部样式，无法封装 | 保留 |
| `style={{ position: 'relative', ...style }}` | 8 处 position:relative | 定位 + 展开，只有外层是定位 | 保留或用 Space 包裹时保留 position |
| `style={{ transform, transition, opacity }}`（拖拽动画） | — | 动态计算值，与 dnd-kit 耦合 | 保留 |
| `ref` + `style` 组合 | — | ref 绑定到容器，无法拆分 | 保留或用 Space 透传 ref |
| 条件样式（`isDragging ? 0.4 : 1`） | — | 动态逻辑嵌入样式 | 保留或用 Space 传 className |
| `cursor: 'pointer'` / `'not-allowed'` | 7 处 | 交互行为样式，不属于布局 | 保留 |
| `userSelect: 'none'` | 9 处 | 交互行为样式，不属于布局 | 保留 |
| `opacity: disabled ? 0.5 : 1` 等 | 9 处 | 动态状态样式 | 保留 |
| `overflow: 'hidden'` / `'auto'` | 15 处 | 容器滚动/裁剪行为 | 保留 |
| `position: 'absolute'` | — | 绝对定位布局 | 保留 |

---

## 拟新增组件 API

### `Space`

```tsx
// 水平排列（默认）
<Space gap="sm">           // gap 映射到 token('spacingSm')
  <Input />
  <Button />
</Space>

// 垂直排列
<Space direction="vertical" gap="md">
  <FieldItem />
  <FieldItem />
</Space>

// 对齐方式
<Space align="start" justify="space-between">
  <span>左</span>
  <span>右</span>
</Space>

// 需要子元素 flex: 1 时，外层用 Space，子元素保留 style
<Space gap="sm">
  <div style={{ flex: 1 }}>左列</div>
  <div style={{ flex: 1 }}>右列</div>
</Space>
```

Props：
- `direction?: 'horizontal' | 'vertical'`（默认 `horizontal`）
- `gap?: SpaceSize`（`'xxs' | 'xs' | 'sm' | 'md' | 'lg' | number`，默认 `'sm'`）
- `align?: 'start' | 'center' | 'end' | 'stretch'`（默认 `center`）
- `justify?: 'start' | 'center' | 'end' | 'space-between'`
- `wrap?: boolean`（默认 `false`）
- `style?` / `className?` / `children`

**实现约束**：Space **不给子元素包 wrapper**，直接渲染为 `<div style={{ display: 'flex', ... }}>{children}</div>`。原因：子元素上的 `flex: 1`、`minWidth: 0` 等样式需要直接作用于 flex 子项，包 wrapper 会导致这些样式失效。这与 antd Space 的实现不同（antd 会包 `<div class="ant-space-item">`），因为 antd Space 只做间距不做弹性分配。

gap 映射表：

| gap 值 | token | 默认值 | 紧凑模式值 |
|---|---|---|---|
| `'xxs'` | `spacingXxs` | 2px | 1px |
| `'xs'` | `spacingXs` | 4px | 2px |
| `'sm'` | `spacingSm` | 8px | 4px |
| `'md'` | `spacingMd` | 12px | 8px |
| `'lg'` | `spacingLg` | 16px | 12px |
| `number` | 直接使用数值 | — | — |

### `Space.Compact`

```tsx
// 紧凑组合（输入框 + 按钮）
<Space.Compact>
  <Input />
  <Button>搜索</Button>
</Space.Compact>
```

Props：
- `align?: 'start' | 'center' | 'end'`（默认 `center`）
- `style?` / `className?` / `children`

### `Divider`

```tsx
<Divider />                              // 默认上边线分隔
<Divider direction="bottom" />           // 下边线分隔
<Divider style={{ marginTop: token('spacingSm') }} />
```

Props：
- `direction?: 'top' | 'bottom'`（默认 `'top'`）— 分隔线方向
- `style?` — 透传额外样式（如 margin）

### `Text`

```tsx
<Text type="secondary">接口地址（GET）</Text>
<Text type="tertiary">用 {fieldName} 引用其他字段</Text>
<Text type="placeholder">请选择</Text>
<Text type="secondary" ellipsis>长文本截断显示</Text>
<Text type="secondary" style={{ lineHeight: 1.5 }}>自定义行高</Text>
```

Props：
- `type?: 'secondary' | 'tertiary' | 'placeholder'`（默认 `secondary`）
- `ellipsis?: boolean`（默认 `false`）— 文本截断，等效于 `overflow: hidden; textOverflow: 'ellipsis'; whiteSpace: 'nowrap'`
- `style?` / `children`

type 映射表：

| type | fontSize | color |
|---|---|---|
| `secondary` | `fontSizeXs` | `var(--fe-text-secondary)` |
| `tertiary` | `fontSizeXs` | `var(--fe-text-tertiary)` |
| `placeholder` | `fontSizeSm` | `var(--fe-text-placeholder)` |

---

## 实施步骤

### 阶段 1：创建新组件（4 个文件）

1. **`packages/core/src/widgets/Space.tsx`** — Space + Space.Compact
2. **`packages/core/src/widgets/Divider.tsx`**
3. **`packages/core/src/widgets/Text.tsx`**
4. 修改 **`packages/core/src/widgets/index.ts`** — 导出新组件

### 阶段 2：逐文件替换（按优先级）

**高优先级**（内联样式最多，收益最大）：
- `packages/core/src/widgets/DataSourceEditor.tsx`（24 处）
- `packages/core/src/widgets/Select.tsx`（8 处）
- `packages/core/src/widgets/OptionsEditor.tsx`（7 处）
- `packages/core/src/widgets/TreeDataEditor.tsx`（9 处）
- `packages/core/src/widgets/ExpressionInput.tsx`（7 处）
- `packages/core/src/propRenders/ItemListEditor.tsx`（11 处）

**中优先级**：
- `packages/core/src/widgets/sortableListShared.tsx`（~5 处）
- `packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx`（~6 处）
- `packages/core/src/propRenders/shared.tsx`（~3 处）
- `packages/core/src/designer/FieldList/FieldList.tsx`（~5 处）
- `packages/core/src/designer/PropertyPanel.tsx`（~3 处）
- `packages/core/src/renderer/FieldRenderer.tsx`（~5 处）
- `packages/core/src/designer/RegionPreview.tsx`（~5 处）
- `packages/core/src/designer/EventHandlerEditor.tsx`（~3 处）
- `packages/core/src/designer/ComponentTree.tsx`（~3 处）
- `packages/core/src/designer/FormConfigPanel.tsx`（~3 处）
- `packages/core/src/designer/FieldItem/FieldItem.tsx`（~3 处）
- `packages/core/src/designer/CollapsibleSection.tsx`（~3 处）
- `packages/core/src/designer/CanvasToolbar.tsx`（~3 处）
- `packages/core/src/propRenders/CustomPropsRender.tsx`（~3 处）

**低优先级**（少量替换，或含不可替换模式）：
- `packages/core/src/designer/` 其余文件（约 20 个文件，每文件 1-3 处）
- `packages/core/src/widgets/Modal.tsx`、`ButtonGroup.tsx` 等
- `packages/core/src/renderer/` 其余文件
- `packages/core/src/propRenders/` 其余文件

### 阶段 3：验证

1. `pnpm lint` — ESLint 检查
2. `pnpm check:tokens` — 确保新组件使用 token
3. `pnpm test` — 现有测试通过
4. `pnpm dev:example` — 设计器 UI 视觉效果无变化

---

## 替换判断标准

### 何时用 Space 替换 margin
- **替换**：连续同级子元素用 `marginBottom` 做间距 → 用 `<Space direction="vertical">` 包裹
- **保留**：单个元素的 margin（如标签与输入框间距）→ 通过组件 `style` 透传，或保留原样

### 何时保留 flex: 1 / width: '100%' / minWidth: 0
- 这些是子元素级别的弹性/尺寸控制，不属于容器布局
- 替换时：外层容器用 Space，子元素保留 `style={{ flex: 1 }}` 等

### 何时保留 position / overflow / 交互样式
- `position: relative/absolute`、`overflow: hidden/auto`、`cursor`、`userSelect`、`opacity` 等属于定位/交互行为，不属于布局
- 替换时：通过 Space/Text 的 `style` 透传，或保留原 div

---

## 验证方式

- `pnpm lint` — 无 ESLint 错误
- `pnpm test` — 现有测试通过
- `pnpm check:tokens` — 新组件无硬编码样式
- `pnpm dev:example` — 设计器 UI 视觉无变化
  - 重点检查页面：属性面板、数据源编辑器、选项编辑器、树数据编辑器、字段列表
  - 每个替换文件完成后，在 dev 环境中目视确认对应区域无视觉变化
